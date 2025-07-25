import { Component, inject, Input, ViewChild } from '@angular/core';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UserPreferences } from '../../core/models/user-preference';
import { UserPreferencesService } from '../../core/services/user-preference.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NavigationService } from '../../core/services/common/navigation.service';
import { ActivatedRoute } from '@angular/router';
import { ParamService } from '../../core/services/param/param.service';
import { ParamProperties } from '../../core/models/param/parameters';
import { ApiErrorHandlerService } from '../../core/services/common/api-error-handler.service';
import { NotificationService } from '../../core/services/common/notification.service';
import { TABLE_MODE } from '../../core/models/param/types';
import { ProperCasePipe } from '../../shared/pipes/properCase.pipe';

@Component({
  selector: 'app-param-table',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule, MatSlideToggleModule, ProperCasePipe],
  templateUrl: './param-table.component.html',
  styleUrl: './param-table.component.scss'
})
export class ParamTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() table_mode: TABLE_MODE = 'TABLE-RECORD';
  @Input() paramHeading: string = 'Table Records';

  isLoading: boolean = false;
  userPreferences: UserPreferences;
  paramType: string | null = null;
  paramData: any = [];
  showInactiveData: boolean = false;
  isEditing: boolean = false;
  showForm: boolean = false;
  currentParamid: number | null = null;

  paramReadOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null,
    isInactive: null,
    inactivatedDate: null
  };

  private paramService = inject(ParamService);
  private errorHandler = inject(ApiErrorHandlerService);
  private notificationService = inject(NotificationService);

  dataSource = new MatTableDataSource<any>([]);
  paramForm: FormGroup;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.paramData;
  }

  displayedColumns: string[] = ['ParamType', 'ParamDesc', 'paramvalue', 'addlparamvalue1', 'addlparamvalue2', 'addlparamvalue3',
    'addlparamvalue4', 'addlparamvalue5', 'actions'];

  formControls: any = {};

  getForm(): void {
    if (this.table_mode === 'PARAM-RECORD') {
      this.formControls = {
        paramType: ['', [Validators.required, Validators.maxLength(10)]],
        paramValue: ['', [Validators.required, Validators.maxLength(20)]],
        paramDesc: ['', [Validators.required, Validators.maxLength(100)]],
        addlParamValue1: ['', [Validators.maxLength(20)]],
        addlParamValue2: ['', [Validators.maxLength(20)]],
        addlParamValue3: ['', [Validators.maxLength(20)]],
        addlParamValue4: ['', [Validators.maxLength(20)]],
        addlParamValue5: ['', [Validators.maxLength(20)]],
      };
    }
    else {
      this.formControls = {
        paramDesc: ['', [Validators.required, Validators.maxLength(100)]],
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  get isParamRecord(): boolean {
    return this.table_mode === 'PARAM-RECORD';
  }

  constructor(
    private userPrefenceService: UserPreferencesService,
    private navigationService: NavigationService,
    private fb: FormBuilder,
  ) {
    this.userPreferences = this.userPrefenceService.getPreferences();
    this.getForm();
    this.paramForm = this.fb.group(this.formControls);
  }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentParamid = null;
    this.paramForm.reset();
  }

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.paramType = this.route.snapshot.paramMap.get('id');
    this.getParameters();
  }

  toggleShowInactiveData(): void {
    this.showInactiveData = !this.showInactiveData;
    this.renderParamData();
  }

  onRecordClick(id: string, paramDesc: string): void {
    this.navigationService.navigate(['param-record', id], { queryParams: { param: paramDesc } });
  }

  addNewParam(): void {
    this.getForm();
    this.paramForm = this.fb.group(this.formControls);
    this.showForm = true;
    this.isEditing = false;
    this.currentParamid = null;
    this.paramForm.reset();
    this.paramForm.get('paramType')?.setValue(this.paramType);
  }

  onEditParam(param: any): void {
    this.getForm();
    this.paramForm = this.fb.group(this.formControls);

    this.showForm = true;
    this.isEditing = true;
    this.currentParamid = param.paramId;
    this.paramForm.patchValue({
      paramType: param.paramType,
      paramValue: param.paramValue,
      paramDesc: param.paramDesc,
      addlParamValue1: param.addlParamValue1,
      addlParamValue2: param.addlParamValue2,
      addlParamValue3: param.addlParamValue3,
      addlParamValue4: param.addlParamValue4,
      addlParamValue5: param.addlParamValue5
    });

    this.paramForm.get('paramType')?.setValue(this.paramType);

    this.paramReadOnlyFields.lastChangedDate = param.lastUpdatedDate ?? param.dateCreated;
    this.paramReadOnlyFields.lastChangedBy = param.lastUpdatedBy ?? param.createdBy;
    this.paramReadOnlyFields.isInactive = param.inactiveCodeFlag === 'N' || !param.inactiveCodeFlag ? 'No' : 'Yes';
    this.paramReadOnlyFields.inactivatedDate = param.inactiveDate;
  }

  renderParamData() {
    if (this.showInactiveData && this.table_mode === 'PARAM-RECORD') {
      this.dataSource.data = this.paramData.filter((data: any) => data?.inactiveCodeFlag === 'Y');
    }
    else if (!this.showInactiveData && this.table_mode === 'PARAM-RECORD') {
      this.dataSource.data = this.paramData.filter((data: any) => data?.inactiveCodeFlag === 'N' || data?.inactiveCodeFlag === null);
    }
    else {
      this.dataSource.data = this.paramData;
    }
  }

  getParameters(): void {

    this.isLoading = true;

    const P_PARAMTYPE: string = this.paramType ? this.paramType : '000';

    this.paramService.getParameters(P_PARAMTYPE).subscribe({
      next: (paramData: ParamProperties[]) => {
        this.paramData = paramData
        this.renderParamData()
        this.isLoading = false;
      },
      error: (error: any) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to search preparers');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading preparers:', error);
      }
    });
  }

  saveRecord(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    const paramData: ParamProperties = this.paramForm.value;

    paramData.paramId = this.currentParamid ?? 0;
    paramData.sortSeq = 1;

    const saveObservable = this.table_mode === 'TABLE-RECORD' ?
      this.paramService.createTableRecord(this.paramForm.value.paramDesc)
      :
      this.isEditing
        ? this.paramService.updateParamRecord(paramData as ParamProperties)
        : this.paramService.createParamRecord(paramData as ParamProperties);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Record ${this.isEditing && (this.table_mode !== 'TABLE-RECORD') ? 'updated' : 'added'} successfully`);
        this.getParameters();
        if (this.table_mode === 'PARAM-RECORD') {
          this.cancelEdit();
        }
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, `Failed to ${this.isEditing && (this.table_mode !== 'TABLE-RECORD') ? 'update' : 'add'} Record`);
        this.notificationService.showError(errorMessage);
        console.error('Error saving Record:', error);
      }
    });
  }

  inActivateParamRecord(paramId: number): void {
    this.paramService.inActivateParamRecord(paramId).subscribe(
      {
        next: (data: any) => {
          this.notificationService.showSuccess(`Param Inactivated successfully`);
          this.getParameters();
        },
        error: (error: any) => {
          let errorMessage = this.errorHandler.handleApiError(error, `Failed to Inactivate Param`);
          this.notificationService.showError(errorMessage);
          console.error('Error Inactivating Param:', error);
        }
      }
    );
  }

  reActivateParamRecord(paramId: number): void {
    this.paramService.reActivateParamRecord(paramId).subscribe(
      {
        next: (data: any) => {
          this.notificationService.showSuccess(`Param Reactivated successfully`);
          this.getParameters();
        },
        error: (error: any) => {
          let errorMessage = this.errorHandler.handleApiError(error, `Failed to Reactivate Param`);
          this.notificationService.showError(errorMessage);
          console.error('Error Reactivating Param:', error);
        }
      }
    );
  }

}
