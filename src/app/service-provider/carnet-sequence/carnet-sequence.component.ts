import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarnetSequence } from '../../core/models/service-provider/carnet-sequence';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { CommonService } from '../../core/services/common.service';
import { Region } from '../../core/models/region';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CustomPaginator } from '../../shared/custom-paginator';
import { CarnetSequenceService } from '../../core/services/carnet-sequence.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-carnet-sequence',
  imports: [AngularMaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './carnet-sequence.component.html',
  styleUrl: './carnet-sequence.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class CarnetSequenceComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['carnetType', 'region', 'startNumber', 'endNumber', 'lastNumber'];
  dataSource = new MatTableDataSource<CarnetSequence>();
  sequenceForm: FormGroup;
  isEditing = false;
  currentSequenceId: string | null = null;
  isLoading = false;
  showForm = false;

  carnetTypes = [
    { label: 'Original', value: 'ORIGINAL' },
    { label: 'Replacement', value: 'REPLACE' }
  ];

  @Input() spid: number = 0;
  @Input() userPreferences!: UserPreferences;
  @Input() isEditMode = false;
  @Output() hasCarnetSequence = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();
  sequences: CarnetSequence[] = [];
  regions: Region[] = [];

  constructor(
    private fb: FormBuilder,
    private carnetSequenceService: CarnetSequenceService,
    private notificationService: NotificationService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.sequenceForm = this.fb.group({
      carnetType: ['ORIGINAL', Validators.required],
      region: ['', Validators.required],
      startNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(1)
      ]],
      endNumber: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(1)
      ]]
    }, { validator: this.validateNumberRange });
  }

  ngOnInit(): void {
    this.loadRegions();
    this.loadSequences();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private validateNumberRange(group: FormGroup): { [key: string]: any } | null {
    const start = +group.get('startNumber')?.value;
    const end = +group.get('endNumber')?.value;
    return start && end && start >= end ? { invalidRange: true } : null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRegions(): void {
    this.commonService.getRegions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (regions) => {
          this.regions = regions;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load regions', error);
          this.isLoading = false;
        }
      });
  }


  private loadSequences(): void {
    if (!this.spid) return;

    this.isLoading = true;

    this.carnetSequenceService.getCarnetSequenceById(this.spid).subscribe({
      next: (carnetSequences: CarnetSequence[]) => {
        // this.sequences = carnetSequences;
        this.isLoading = false;
        this.dataSource.data = carnetSequences;
        this.isLoading = false;
      },
      error: (error: any) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load sequences');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading sequences:', error);
      }
    });
  }

  addSequence(): void {
    if (this.sequenceForm.invalid) {
      this.sequenceForm.markAllAsTouched();
      return;
    }

    const sequenceData = {
      ...this.sequenceForm.value,
      spid: this.spid,
      lastNumber: this.sequenceForm.value.startNumber
    };

    this.carnetSequenceService.createCarnetSequence(sequenceData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Sequence added successfully');
        this.loadSequences();
        this.hasCarnetSequence.emit(true);
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to add sequence');
        this.notificationService.showError(errorMessage);
        console.error('Error adding sequence:', error);
      }
    });
  }

  // applyFilter(event: Event): void {
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();

  //   if (this.dataSource.paginator) {
  //     this.dataSource.paginator.firstPage();
  //   }
  // }

  addNewSequence(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentSequenceId = null;
    this.sequenceForm.reset({ carnetType: 'ORIGINAL' });
  }

  saveSequence(): void {
    if (this.sequenceForm.invalid) {
      this.sequenceForm.markAllAsTouched();
      return;
    }

    const sequenceData: CarnetSequence = {
      ...this.sequenceForm.value,
      spid: this.spid
    };

    this.carnetSequenceService.createCarnetSequence(sequenceData)
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Sequence added successfully');
          this.loadSequences();
          this.cancelEdit();
          this.hasCarnetSequence.emit(true);
        },
        error: (error) => {
          let errorMessage = this.errorHandler.handleApiError(error, `Failed to add sequence`);
          this.notificationService.showError(errorMessage);
          console.error('Error adding sequence:', error);
        }
      });
  }

  // deleteSequence(sequenceId: string): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this sequence?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.carnetSequenceService.deleteSequence(sequenceId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Sequence deleted successfully');
  //           this.loadSequences();
  //           this.saved.emit(true);
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete sequence');
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentSequenceId = null;
    this.sequenceForm.reset({ carnetType: 'ORIGINAL' });
  }

  getCarnetTypeLabel(type: string): string {
    return this.carnetTypes.find(t => t.value === type)?.label || type;
  }

  getRegionLabel(type: number): string {
    return this.regions.find(t => t.id === type)?.regionname || type.toString();
  }
}