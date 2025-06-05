import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BasicFeeService } from '../../core/services/basic-fee.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BasicFee } from '../../core/models/service-provider/basic-fee';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CustomPaginator } from '../../shared/custom-paginator';
import { forkJoin } from 'rxjs';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-basic-fee',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './basic-fee.component.html',
  styleUrl: './basic-fee.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class BasicFeeComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['startCarnetValue', 'endCarnetValue', 'fees', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<BasicFee>();
  feeForm: FormGroup;
  isEditing = false;
  currentFeeId: number | null = null;
  isLoading = false;
  showForm = false;

  readOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null
  };

  @Input() isEditMode = false;
  @Input() userPreferences!: UserPreferences;
  @Input() spid: number = 0;
  @Output() hasBasicFees = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private basicFeeService: BasicFeeService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.feeForm = this.fb.group({
      startCarnetValue: [0, [Validators.required, Validators.min(0)]],
      endCarnetValue: [null, [Validators.min(0)]],
      fees: [0, [Validators.required, Validators.min(0)]],
      effectiveDate: ['', Validators.required]
    }, { validators: this.validateRange });
  }

  ngOnInit(): void {
    this.loadBasicFees();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadBasicFees(): void {
    this.isLoading = true;
    this.basicFeeService.getBasicFees(this.spid).subscribe({
      next: (fees) => {
        this.dataSource.data = fees;
        this.hasBasicFees.emit(fees.length > 0);
        this.isLoading = false;

        if (this.dataSource.data.length == 0) {
          this.initializeDefaultFees();
        }
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load basic fees');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading basic fees:', error);
      }
    });
  }

  initializeDefaultFees(): void {
    this.isLoading = true;
    const defaultFees: BasicFee[] = [
      { basicFeeId: 0, startCarnetValue: 1, endCarnetValue: 9999, fees: 255, effectiveDate: new Date() },
      { basicFeeId: 0, startCarnetValue: 10000, endCarnetValue: 49999, fees: 300, effectiveDate: new Date() },
      { basicFeeId: 0, startCarnetValue: 50000, endCarnetValue: 149999, fees: 365, effectiveDate: new Date() },
      { basicFeeId: 0, startCarnetValue: 150000, endCarnetValue: 399999, fees: 425, effectiveDate: new Date() },
      { basicFeeId: 0, startCarnetValue: 400000, endCarnetValue: 999999, fees: 480, effectiveDate: new Date() },
      { basicFeeId: 0, startCarnetValue: 1000000, endCarnetValue: null, fees: 545, effectiveDate: new Date() }
    ];

    // Create an array of observables for each fee creation
    const creationObservables = defaultFees.map(fee =>
      this.basicFeeService.createBasicFee(this.spid, fee)
    );

    // Execute all creations in parallel and wait for all to complete
    forkJoin(creationObservables).subscribe({
      next: () => {
        this.loadBasicFees(); // Refresh the list after all creations are done
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error initializing default fees:', error);
        // Even if some failed, try to load what was created
        this.loadBasicFees();
      }
    });
  }

  validateRange(formGroup: FormGroup): { [key: string]: any } | null {
    const start = formGroup.get('startCarnetValue')?.value;
    const end = formGroup.get('endCarnetValue')?.value;

    if (end !== null && start !== null && end <= start) {
      return { invalidRange: true };
    }
    return null;
  }

  // addNewFee(): void {
  //   this.showForm = true;
  //   this.isEditing = false;
  //   this.currentFeeId = null;
  //   this.feeForm.reset({
  //     startCarnetValue: 0,
  //     endCarnetValue: null,
  //     fees: 0
  //   });
  // }

  editFee(fee: BasicFee): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentFeeId = fee.basicFeeId;
    this.feeForm.patchValue({
      startCarnetValue: fee.startCarnetValue,
      endCarnetValue: fee.endCarnetValue,
      fees: fee.fees,
      effectiveDate: fee.effectiveDate
    });

    this.readOnlyFields.lastChangedDate = fee.dateCreated;
    this.readOnlyFields.lastChangedBy = fee.createdBy;

    this.feeForm.get('startCarnetValue')?.disable();
    this.feeForm.get('endCarnetValue')?.disable();
  }

  saveFee(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    const feeData: BasicFee = {
      basicFeeId: this.currentFeeId || 0,
      startCarnetValue: this.feeForm.value.startCarnetValue,
      endCarnetValue: this.feeForm.value.endCarnetValue,
      fees: this.feeForm.value.fees,
      effectiveDate: this.feeForm.value.effectiveDate,
      spid: this.spid
    };

    const saveObservable = this.isEditing && this.currentFeeId
      ? this.basicFeeService.updateBasicFee(this.currentFeeId, feeData)
      : this.basicFeeService.createBasicFee(this.spid, feeData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Basic fee ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadBasicFees();
        this.cancelEdit();
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} basic fee`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving basic fee:', error);
      }
    });
  }

  // deleteFee(feeId: number): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this basic fee?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.basicFeeService.deleteBasicFee(feeId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Basic fee deleted successfully');
  //           this.loadBasicFees();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete basic fee');
  //           console.error('Error deleting basic fee:', error);
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentFeeId = null;
    this.feeForm.reset();
  }
}
