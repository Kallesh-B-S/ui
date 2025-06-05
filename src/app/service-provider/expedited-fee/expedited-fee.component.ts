import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
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
import { ExpeditedFee } from '../../core/models/service-provider/expedited-fee';
import { DeliveryType } from '../../core/models/delivery-type';
import { TimeZone } from '../../core/models/timezone';
import { CommonService } from '../../core/services/common.service';
import { Subject, takeUntil } from 'rxjs';
import { ExpeditedFeeService } from '../../core/services/expedited-fee.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { TimeFormatService } from '../../core/services/timeformat.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-expedited-fee',
  imports: [AngularMaterialModule, CommonModule, ReactiveFormsModule],
  templateUrl: './expedited-fee.component.html',
  styleUrl: './expedited-fee.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class ExpeditedFeeComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['customerType', 'deliveryType', 'time', 'fee', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<any>();
  feeForm: FormGroup;
  isEditing = false;
  currentFeeId: number | null = null;
  isLoading = false;
  showForm = false;

  readOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null
  };

  private destroy$ = new Subject<void>();

  @Input() isEditMode = false;
  @Input() spid: number = 0;
  @Input() userPreferences!: UserPreferences;
  @Output() hasExpeditedFees = new EventEmitter<boolean>();

  customerTypes = [
    { value: 'PREPARER', label: 'Preparer' },
    { value: 'SELFISSUER', label: 'Self issuer' }
  ];

  deliveryTypes: DeliveryType[] = [];
  timeZones: TimeZone[] = [];

  constructor(
    private fb: FormBuilder,
    private expeditedFeeService: ExpeditedFeeService,
    private notificationService: NotificationService,
    private commonService: CommonService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService,
    private timeFormatHelper: TimeFormatService
  ) {
    this.feeForm = this.fb.group({
      customerType: ['PREPARER', Validators.required],
      deliveryType: ['', Validators.required],
      startTime: [0, Validators.required],
      endTime: [0],
      timeZone: ['', Validators.required],
      fee: [0, [Validators.required, Validators.min(0)]],
      effectiveDate: ['', Validators.required]
    }, { validator: this.validateNumberRange });
  }

  ngOnInit(): void {
    this.loadExpeditedFees();
    this.loadLookupData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private validateNumberRange(group: FormGroup): { [key: string]: any } | null {
    const start = +group.get('startTime')?.value;
    const end = +group.get('endTime')?.value;
    return start && end && start >= end ? { invalidRange: true } : null;
  }

  loadExpeditedFees(): void {
    this.isLoading = true;

    this.expeditedFeeService.getExpeditedFees(this.spid).subscribe({
      next: (fees: ExpeditedFee[]) => {
        this.dataSource.data = fees;
        this.isLoading = false;
      },
      error: (error: any) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load expedited fees');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading expedited fees:', error);
      }
    });
  }

  loadLookupData(): void {
    this.loadDeliveryTypes();
    this.loadTimeZones();
  }

  loadTimeZones(): void {
    this.commonService.getTimezones()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (timeZones) => {
          this.timeZones = timeZones;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to load time zones', error);
          this.isLoading = false;
        }
      });
  }

  loadDeliveryTypes(): void {
    this.commonService.getDeliveryTypes(this.spid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (deliveryTypes) => {
          this.deliveryTypes = deliveryTypes;
        },
        error: (error) => {
          console.error('Failed to load delivery types', error);
          this.isLoading = false;
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

  addNewFee(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentFeeId = null;
    this.feeForm.reset({
      customerType: 'PREPARER'
    });
    this.feeForm.patchValue({ fee: 0 });

    this.feeForm.get('customerType')?.enable();
    this.feeForm.get('deliveryType')?.enable();
    this.feeForm.get('startTime')?.enable();
    this.feeForm.get('endTime')?.enable();
    this.feeForm.get('timeZone')?.enable();
  }

  editFee(fee: ExpeditedFee): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentFeeId = fee.expeditedFeeId;
    this.feeForm.patchValue({
      customerType: fee.customerType,
      deliveryType: fee.deliveryType,
      startTime: fee.startTime,
      endTime: fee.endTime,
      timeZone: fee.timeZone,
      fee: fee.fee,
      effectiveDate: fee.effectiveDate
    });

    this.readOnlyFields.lastChangedDate = fee.dateCreated;
    this.readOnlyFields.lastChangedBy = fee.createdBy;

    this.feeForm.get('customerType')?.disable();
    this.feeForm.get('deliveryType')?.disable();
    this.feeForm.get('startTime')?.disable();
    this.feeForm.get('endTime')?.disable();
    this.feeForm.get('timeZone')?.disable();
  }

  saveFee(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      return;
    }

    const feeData = this.feeForm.value;
    const saveObservable = this.isEditing && this.currentFeeId
      ? this.expeditedFeeService.updateExpeditedFee(this.currentFeeId, feeData)
      : this.expeditedFeeService.createExpeditedFee(this.spid, feeData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Expedited fee ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadExpeditedFees();
        this.cancelEdit();
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} expedited fee`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving expedited fee:', error);
      }
    });
  }

  // deleteFee(feeId: string): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this expedited fee?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.expeditedFeeService.deleteExpeditedFee(feeId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Expedited fee deleted successfully');
  //           this.loadExpeditedFees();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete expedited fee');
  //           console.error('Error deleting expedited fee:', error);
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentFeeId = null;
    this.feeForm.reset({
      customerType: 'PREPARER'
    });
  }

  getCustomerTypeLabel(value: string): string {
    const type = this.customerTypes.find(t => t.value === value);
    return type ? type.label : value;
  }

  getDeliveryLabel(value: string): string {
    const delivery = this.deliveryTypes.find(t => t.value === value);
    return delivery ? delivery.name : value;
  }

  getTimeLabel(startTime: string, endTime: string, timeZone: string): string {
    return this.timeFormatHelper.formatTimeRange(startTime, timeZone, endTime);
  }
}