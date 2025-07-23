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
import { ParamTableForm, ParamValue, ParamValueForm } from '../../core/models/param/paramValue';
import { ApiErrorHandlerService } from '../../core/services/common/api-error-handler.service';
import { NotificationService } from '../../core/services/common/notification.service';
import { TABLE_MODE } from '../../core/models/param/types';

@Component({
  selector: 'app-param-table',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule, MatSlideToggleModule],
  templateUrl: './param-table.component.html',
  styleUrl: './param-table.component.scss'
})
export class ParamTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() table_mode: TABLE_MODE = 'TABLE-RECORD'
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
        paramDescription: ['', [Validators.required, Validators.maxLength(100)]],
        Additional_Param_Value1: ['', [Validators.maxLength(20)]],
        Additional_Param_Value2: ['', [Validators.maxLength(20)]],
        Additional_Param_Value3: ['', [Validators.maxLength(20)]],
        Additional_Param_Value4: ['', [Validators.maxLength(20)]],
        Additional_Param_Value5: ['', [Validators.maxLength(20)]],
      };
    }
    else {
      this.formControls = {
        paramDescription: ['', [Validators.required, Validators.maxLength(100)]],
      }
    }
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
    this.getParamValues();
  }

  getParamValues(): void {

    this.isLoading = true;

    const P_PARAMTYPE: string = this.paramType ? this.paramType : '000';

    this.paramService.getParamValues(P_PARAMTYPE).subscribe({
      next: (paramData: ParamValue[]) => {
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

  renderParamData() {

    if (this.showInactiveData && this.table_mode === 'PARAM-RECORD') {
      this.dataSource.data = this.paramData.filter((data: any) => data?.INACTIVECODEFLAG === 'Y');
    }
    else if (!this.showInactiveData && this.table_mode === 'PARAM-RECORD') {
      this.dataSource.data = this.paramData.filter((data: any) => data?.INACTIVECODEFLAG === 'N' || data?.INACTIVECODEFLAG === null);
    }
    else {
      this.dataSource.data = this.paramData;
    }
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
    this.currentParamid = param.PARAMID;
    this.paramForm.patchValue({
      paramType: param.PARAMTYPE,
      paramValue: param.PARAMVALUE,
      paramDescription: param.PARAMDESC,
      Additional_Param_Value1: param.ADDLPARAMVALUE1,
      Additional_Param_Value2: param.ADDLPARAMVALUE2,
      Additional_Param_Value3: param.ADDLPARAMVALUE3,
      Additional_Param_Value4: param.ADDLPARAMVALUE4,
      Additional_Param_Value5: param.ADDLPARAMVALUE5
    });

    this.paramForm.get('paramType')?.setValue(this.paramType);

    this.paramReadOnlyFields.lastChangedDate = param.LASTUPDATEDDATE ?? param.DATECREATED;
    this.paramReadOnlyFields.lastChangedBy = param.LASTUPDATEDBY ?? param.CREATEDBY;
    this.paramReadOnlyFields.isInactive = param.INACTIVECODEFLAG === 'N' || !param.INACTIVECODEFLAG ? 'No' : 'Yes';
    this.paramReadOnlyFields.inactivatedDate = param.INACTIVEDATE;
  }

  saveRecord(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    let paramData: ParamTableForm | ParamValueForm;

    if (this.table_mode === 'TABLE-RECORD') {
      paramData = {
        P_TABLEFULLDESC: this.paramForm.value.paramDescription,
      } as ParamTableForm;
    } else {
      paramData = {
        P_PARAMTYPE: this.paramForm.value.paramType,
        ...(this.isEditing && { P_PARAMID: this.currentParamid ?? 0 }),
        P_PARAMDESC: this.paramForm.value.paramDescription,
        P_PARAMVALUE: this.paramForm.value.paramValue,
        P_ADDLPARAMVALUE1: this.paramForm.value.Additional_Param_Value1,
        P_ADDLPARAMVALUE2: this.paramForm.value.Additional_Param_Value2,
        P_ADDLPARAMVALUE3: this.paramForm.value.Additional_Param_Value3,
        P_ADDLPARAMVALUE4: this.paramForm.value.Additional_Param_Value4,
        P_ADDLPARAMVALUE5: this.paramForm.value.Additional_Param_Value5,
        P_SORTSEQ: 1
      } as ParamValueForm;
    }

    const saveObservable = this.table_mode === 'TABLE-RECORD' ?
      this.paramService.CreateTableRecord(paramData as ParamTableForm)
      :
      this.isEditing
        ? this.paramService.UpdateParamRecord(paramData as ParamValueForm)
        : this.paramService.CreateParamRecord(paramData as ParamValueForm);

    saveObservable.subscribe({
      next: () => {
        this.notificationService.showSuccess(`Record ${this.isEditing && (this.table_mode !== 'TABLE-RECORD') ? 'updated' : 'added'} successfully`);
        this.getParamValues();
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

  InActivateParamRecord(PARAMID: number): void {
    this.paramService.InActivateParamRecord(PARAMID).subscribe(
      {
        next: (data: any) => {
          this.notificationService.showSuccess(`Param Inactivated successfully`);
          this.getParamValues();
        },
        error: (error: any) => {
          let errorMessage = this.errorHandler.handleApiError(error, `Failed to Inactivate Param`);
          this.notificationService.showError(errorMessage);
          console.error('Error Inactivating Param:', error);
        }
      }
    );
  }

  ReActivateParamRecord(PARAMID: number): void {
    this.paramService.ReActivateParamRecord(PARAMID).subscribe(
      {
        next: (data: any) => {
          this.notificationService.showSuccess(`Param Reactivated successfully`);
          this.getParamValues();
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
