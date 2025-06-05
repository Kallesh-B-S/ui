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
import { Country } from '../../core/models/country';
import { CommonService } from '../../core/services/common.service';
import { SecurityDeposit } from '../../core/models/service-provider/security-deposit';
import { SecurityDepositService } from '../../core/services/security-deposit.service';
import { ApiErrorHandlerService } from '../../core/services/api-error-handler.service';
import { UserPreferences } from '../../core/models/user-preference';

@Component({
  selector: 'app-security-deposit',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './security-deposit.component.html',
  styleUrl: './security-deposit.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class SecurityDepositComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['holderType', 'uscibMember', 'specialCommodity', 'specialCountry', 'rate', 'effectiveDate', 'actions'];
  dataSource = new MatTableDataSource<any>();
  depositForm: FormGroup;
  isEditing = false;
  currentDepositId: number | null = null;
  isLoading = false;
  showForm = false;

  readOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null
  };

  countries: Country[] = [];

  @Input() isEditMode = false;
  @Input() spid: number = 0;
  @Input() userPreferences!: UserPreferences;
  @Output() hasSecurityDeposits = new EventEmitter<boolean>();

  holderTypes = [
    { value: 'CORP', label: 'Corporation' },
    { value: 'INDIVIDUAL', label: 'Individual' },
    { value: 'GOVERNMENT', label: 'Government Agency' }
  ];

  yesNoOptions = [
    { value: 'Y', label: 'Yes' },
    { value: 'N', label: 'No' }
  ];

  constructor(
    private fb: FormBuilder,
    private securityDepositService: SecurityDepositService,
    private commonService: CommonService,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private errorHandler: ApiErrorHandlerService
  ) {
    this.depositForm = this.fb.group({
      holderType: ['CORP', Validators.required],
      uscibMember: ['Y', Validators.required],
      specialCommodity: [''],
      specialCountry: [''],
      rate: [0, [Validators.required, Validators.min(0)]],
      effectiveDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSecurityDeposits();
    this.loadCountries();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadSecurityDeposits(): void {
    this.isLoading = true;
    this.securityDepositService.getSecurityDeposits(this.spid).subscribe({
      next: (deposits) => {
        this.dataSource.data = deposits;
        this.isLoading = false;
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load security deposits');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading security deposits:', error);
      }
    });
  }

  loadCountries(): void {
    this.commonService.getCountries().subscribe({
      next: (countries) => {
        this.countries = countries;
      },
      error: (error) => {
        console.error('Error loading countries:', error);
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

  addNewDeposit(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentDepositId = null;
    this.depositForm.reset({
      holderType: 'CORP',
      uscibMember: 'N',
    });
    this.depositForm.patchValue({ rate: 0 });

    this.depositForm.get('holderType')?.enable();
    this.depositForm.get('uscibMember')?.enable();
    this.depositForm.get('specialCommodity')?.enable();
    this.depositForm.get('specialCountry')?.enable();
  }

  editDeposit(deposit: SecurityDeposit): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentDepositId = deposit.securityDepositId;
    this.depositForm.patchValue({
      holderType: deposit.holderType,
      uscibMember: deposit.uscibMember ? 'Y' : 'N',
      specialCommodity: deposit.specialCommodity,
      specialCountry: deposit.specialCountry,
      rate: deposit.rate,
      effectiveDate: deposit.effectiveDate
    });

    this.readOnlyFields.lastChangedDate = deposit.dateCreated;
    this.readOnlyFields.lastChangedBy = deposit.createdBy;

    this.depositForm.get('holderType')?.disable();
    this.depositForm.get('uscibMember')?.disable();
    this.depositForm.get('specialCommodity')?.disable();
    this.depositForm.get('specialCountry')?.disable();
  }

  saveDeposit(): void {
    if (this.depositForm.invalid) {
      this.depositForm.markAllAsTouched();
      return;
    }

    const depositData = {
      ...this.depositForm.value,
      uscibMember: this.depositForm.value.uscibMember === 'Y',
      specialCommodity: this.depositForm.value.specialCommodity || null,
      specialCountry: this.depositForm.value.specialCountry || null
    };

    const saveObservable = this.isEditing && this.currentDepositId
      ? this.securityDepositService.updateSecurityDeposit(this.currentDepositId, depositData)
      : this.securityDepositService.createSecurityDeposit(this.spid, depositData);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Security deposit ${this.isEditing ? 'updated' : 'added'} successfully`);
        this.loadSecurityDeposits();
        this.cancelEdit();
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing ? 'update' : 'add'} security deposit`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving security deposit:', error);
      }
    });
  }

  // deleteDeposit(depositId: string): void {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, {
  //     width: '350px',
  //     data: {
  //       title: 'Confirm Delete',
  //       message: 'Are you sure you want to delete this security deposit?',
  //       confirmText: 'Delete',
  //       cancelText: 'Cancel'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //       this.securityDepositService.deleteSecurityDeposit(depositId).subscribe({
  //         next: () => {
  //           this.notificationService.showSuccess('Security deposit deleted successfully');
  //           this.loadSecurityDeposits();
  //         },
  //         error: (error) => {
  //           this.notificationService.showError('Failed to delete security deposit');
  //           console.error('Error deleting security deposit:', error);
  //         }
  //       });
  //     }
  //   });
  // }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentDepositId = null;
    this.depositForm.reset({
      holderType: 'CORP',
      uscibMember: 'N',
    });
  }

  getHolderTypeLabel(value: string): string {
    const type = this.holderTypes.find(t => t.value === value);
    return type ? type.label : value;
  }

  getCountryName(code: string): string {
    const country = this.countries.find(c => c.value === code);
    return country ? country.name : code;
  }
}