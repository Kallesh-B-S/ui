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
import { of } from 'rxjs';
import { CustomPaginator } from '../../shared/custom-paginator';
import { ContinuationSheetFeeService } from '../../core/services/continuation-sheet-fee.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-continuation-sheet-fee',
  imports: [AngularMaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './continuation-sheet-fee.component.html',
  styleUrl: './continuation-sheet-fee.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class ContinuationSheetFeeComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['customerType', 'carnetType', 'rate', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<any>();
  continuationSheetForm: FormGroup;
  isEditing = false;
  currentContinuationSheetId: number | null = null;
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
  @Output() hasContinuationSheetFee = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private continuationSheetFeeService: ContinuationSheetFeeService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.continuationSheetForm = this.fb.group({
      customerType: ['PREPARER', Validators.required],
      carnetType: ['ORIGINAL', Validators.required],
      rate: ['', [
        Validators.required,
        Validators.pattern(/^\d+\.?\d{0,2}$/),
        Validators.min(0)
      ]],
      effectiveDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContinuationSheets();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContinuationSheets(): void {
    if (!this.spid) return;

    this.isLoading = true;
    this.continuationSheetFeeService.getContinuationSheets(this.spid).subscribe({
      next: (continuationSheets) => {
        this.dataSource.data = continuationSheets;
        this.isLoading = false;
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load continuation sheets');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        return of([]);
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

  addNewContinuationSheet(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentContinuationSheetId = null;
    this.continuationSheetForm.reset({
      customerType: 'PREPARER',
      carnetType: 'ORIGINAL'
    });

    this.continuationSheetForm.get('customerType')?.enable();
    this.continuationSheetForm.get('carnetType')?.enable();
  }

  editContinuationSheet(continuationSheet: any): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentContinuationSheetId = continuationSheet.id;
    this.continuationSheetForm.patchValue({
      customerType: continuationSheet.customerType,
      carnetType: continuationSheet.carnetType,
      rate: continuationSheet.rate,
      effectiveDate: new Date(continuationSheet.effectiveDate)
    });

    this.readOnlyFields.lastChangedDate = continuationSheet.dateCreated;
    this.readOnlyFields.lastChangedBy = continuationSheet.createdBy;

    this.continuationSheetForm.get('customerType')?.disable();
    this.continuationSheetForm.get('carnetType')?.disable();
  }

  saveContinuationSheet(): void {
    if (this.continuationSheetForm.invalid) {
      this.continuationSheetForm.markAllAsTouched();
      return;
    }

    const continuationSheetData = {
      ...this.continuationSheetForm.value,
      spid: this.spid
    };

    const saveObservable = this.isEditing && this.currentContinuationSheetId
      ? this.continuationSheetFeeService.updateContinuationSheet(this.currentContinuationSheetId, continuationSheetData)
      : this.continuationSheetFeeService.addContinuationSheet(this.spid, continuationSheetData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Continuation Sheet ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadContinuationSheets();
        this.cancelEdit();
        this.hasContinuationSheetFee.emit(true);
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} continuation sheet`);
        this.notificationService.showError(errorMessage);
        return of(null);
      }
    });
  }

  // deleteContinuationSheet(continuationSheetId: string): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this continuation sheet setup?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.continuationSheetFeeService.deleteContinuationSheet(continuationSheetId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Continuation sheet deleted successfully');
  //           this.loadContinuationSheets();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete continuation sheet');
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentContinuationSheetId = null;
    this.continuationSheetForm.reset({
      customerType: 'PREPARER',
      carnetType: 'ORIGINAL'
    });
  }

  getOptionLabel(options: any[], value: string): string {
    return options.find(opt => opt.value === value)?.label || value;
  }
}