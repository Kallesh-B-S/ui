
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { CustomPaginator } from '../../shared/custom-paginator';
import { CommonService } from '../../core/services/common.service';
import { CarnetFee } from '../../core/models/service-provider/carnet-fee';
import { FeeType } from '../../core/models/fee-type';
import { CarnetFeeService } from '../../core/services/carnet-fee.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-carnet-fee',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './carnet-fee.component.html',
  styleUrl: './carnet-fee.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class CarnetFeeComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['feeType', 'commissionRate', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<CarnetFee>();
  feeCommissionForm: FormGroup;
  isEditing = false;
  currentFeeCommissionId: number | null = null;
  isLoading = false;
  showForm = false;
  feeTypes: FeeType[] = [];

  readOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null
  };

  @Input() isEditMode = false;
  @Input() userPreferences!: UserPreferences;
  @Input() spid: number = 0;
  @Output() hasFeeCommissions = new EventEmitter<boolean>();

  constructor(
    private fb: FormBuilder,
    private feeCommissionService: CarnetFeeService,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.feeCommissionForm = this.fb.group({
      feeType: ['', Validators.required],
      commissionRate: [0, [Validators.required]],
      effectiveDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadFeeCommissions();
    this.loadFeeTypes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadFeeCommissions(): void {
    this.isLoading = true;
    this.feeCommissionService.getFeeCommissions(this.spid).subscribe({
      next: (fees) => {
        this.dataSource.data = fees;
        this.hasFeeCommissions.emit(fees.length > 0);
        this.isLoading = false;
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load fee & commission data');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading fee & commission data:', error);
      }
    });
  }

  loadFeeTypes(): void {
    this.commonService.getFeeTypes().subscribe({
      next: (types) => {
        this.feeTypes = types;
      },
      error: (error) => {
        console.error('Error loading fee types:', error);
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

  addNewFeeCommission(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentFeeCommissionId = null;
    this.feeCommissionForm.reset();

    this.feeCommissionForm.get('feeType')?.enable();
  }

  editFeeCommission(feeCommission: CarnetFee): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentFeeCommissionId = feeCommission.feeCommissionId;
    this.feeCommissionForm.patchValue({
      feeType: feeCommission.feeType,
      commissionRate: feeCommission.commissionRate,
      effectiveDate: feeCommission.effectiveDate
    });

    this.readOnlyFields.lastChangedDate = feeCommission.dateCreated;
    this.readOnlyFields.lastChangedBy = feeCommission.createdBy;

    this.feeCommissionForm.get('feeType')?.disable();
  }

  saveFeeCommission(): void {
    if (this.feeCommissionForm.invalid) {
      this.feeCommissionForm.markAllAsTouched();
      return;
    }

    const formData = this.feeCommissionForm.value;
    const feeCommissionData: CarnetFee = {
      feeCommissionId: this.currentFeeCommissionId || 0,
      feeType: formData.feeType,
      commissionRate: formData.commissionRate,
      effectiveDate: formData.effectiveDate,
      spid: this.spid
    };

    const saveObservable = this.isEditing && this.currentFeeCommissionId
      ? this.feeCommissionService.updateFeeCommission(this.currentFeeCommissionId, feeCommissionData)
      : this.feeCommissionService.createFeeCommission(this.spid, feeCommissionData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Fee & commission ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadFeeCommissions();
        this.cancelEdit();
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} fee & commission`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving fee & commission:', error);
      }
    });
  }

  // deleteFeeCommission(feeCommissionId: number): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this fee & commission record?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.feeCommissionService.deleteFeeCommission(feeCommissionId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Fee & commission record deleted successfully');
  //           this.loadFeeCommissions();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete fee & commission record');
  //           console.error('Error deleting fee & commission record:', error);
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentFeeCommissionId = null;
    this.feeCommissionForm.reset();
  }

  getFeeTypeLabel(value: string): string {
    const type = this.feeTypes.find(t => t.id === value);
    return type ? type.name : value;
  }
}