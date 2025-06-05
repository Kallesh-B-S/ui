import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../core/services/notification.service';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { CommonModule } from '@angular/common';
import { CounterfoilFee } from '../../core/models/service-provider/counterfoil-fee';
import { CustomPaginator } from '../../shared/custom-paginator';
import { CounterfoilFeeService } from '../../core/services/counterfoil-fee.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-counterfoil-fee',
  imports: [AngularMaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './counterfoil-fee.component.html',
  styleUrl: './counterfoil-fee.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class CounterfoilFeeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['customerType', 'carnetType', 'startSets', 'endSets', 'rate', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<any>();
  counterfoilForm: FormGroup;
  isEditing = false;
  currentCounterfoilId: number | null = null;
  isLoading = false;
  showForm = false;

  readOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null
  };

  // Dropdown options
  customerTypes = [
    { label: 'Preparer', value: 'PREPARER' },
    { label: 'Self Issuer', value: 'SELFISSUER' }
  ];

  carnetTypes = [
    { label: 'Original', value: 'ORIGINAL' },
    { label: 'Re-order', value: 'REORDER' },
    { label: 'Replacement', value: 'REPLACE' }
  ];

  @Input() isEditMode = false;
  @Input() spid: number = 0;
  @Input() userPreferences!: UserPreferences;
  @Output() hasCounterFoilFee = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private counterfoilFeeService: CounterfoilFeeService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.counterfoilForm = this.fb.group({
      customerType: ['PREPARER', Validators.required],
      carnetType: ['ORIGINAL', Validators.required],
      startSets: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(1)
      ]],
      endSets: ['', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.min(1)
      ]],
      rate: ['', [
        Validators.required,
        Validators.pattern(/^\d+\.?\d{0,2}$/),
        Validators.min(0)
      ]],
      effectiveDate: ['', Validators.required]
    }, { validator: this.validateSetsRange });
  }

  ngOnInit(): void {
    this.loadCounterfoils();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private validateSetsRange(group: FormGroup): { [key: string]: any } | null {
    const start = +group.get('startSets')?.value;
    const end = +group.get('endSets')?.value;
    return start && end && start >= end ? { invalidRange: true } : null;
  }

  loadCounterfoils(): void {
    if (!this.spid) return;

    this.isLoading = true;
    this.counterfoilFeeService.getCounterfoils(this.spid)
      .subscribe({
        next: (
          counterfoils: CounterfoilFee[]) => {
          this.dataSource.data = counterfoils;
          this.isLoading = false;
        },
        error: (error: any) => {
          let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load counterfoils');
          this.notificationService.showError(errorMessage);
          this.isLoading = false;
          console.error('Error loading counterfoils:', error);
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

  addNewCounterfoil(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentCounterfoilId = null;
    this.counterfoilForm.reset({
      customerType: 'PREPARER',
      carnetType: 'ORIGINAL'
    });

    this.counterfoilForm.get('customerType')?.enable();
    this.counterfoilForm.get('carnetType')?.enable();
    this.counterfoilForm.get('startSets')?.enable();
    this.counterfoilForm.get('endSets')?.enable();
  }

  editCounterfoil(counterfoil: any): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentCounterfoilId = counterfoil.id;
    this.counterfoilForm.patchValue({
      customerType: counterfoil.customerType,
      carnetType: counterfoil.carnetType,
      startSets: counterfoil.startSets,
      endSets: counterfoil.endSets,
      rate: counterfoil.rate,
      effectiveDate: new Date(counterfoil.effectiveDate)
    });

    this.readOnlyFields.lastChangedDate = counterfoil.dateCreated;
    this.readOnlyFields.lastChangedBy = counterfoil.createdBy;

    this.counterfoilForm.get('customerType')?.disable();
    this.counterfoilForm.get('carnetType')?.disable();
    this.counterfoilForm.get('startSets')?.disable();
    this.counterfoilForm.get('endSets')?.disable();
  }

  saveCounterfoil(): void {
    if (this.counterfoilForm.invalid) {
      this.counterfoilForm.markAllAsTouched();
      return;
    }

    const counterfoilData = {
      ...this.counterfoilForm.value,
      spid: this.spid
    };

    const saveObservable = this.isEditing && this.currentCounterfoilId
      ? this.counterfoilFeeService.updateCounterfoil(this.currentCounterfoilId, counterfoilData)
      : this.counterfoilFeeService.addCounterfoil(this.spid, counterfoilData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Counterfoil ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadCounterfoils();
        this.cancelEdit();
        this.hasCounterFoilFee.emit(true);
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} counterfoil`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving counterfoil:', error);
      }
    });
  }

  // deleteCounterfoil(counterfoilId: string): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this counterfoil setup?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.counterfoilFeeService.deleteCounterfoil(counterfoilId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Counterfoil deleted successfully');
  //           this.loadCounterfoils();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete counterfoil');
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentCounterfoilId = null;
    this.counterfoilForm.reset({
      customerType: 'PREPARER',
      carnetType: 'ORIGINAL'
    });
  }

  getOptionLabel(options: any[], value: string): string {
    return options.find(opt => opt.value === value)?.label || value;
  }
}