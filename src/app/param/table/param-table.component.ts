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
  currentContactId: number | null = 0;
  currentParamid: number | null = null;

  contactReadOnlyFields: any = {
    lastChangedDate: null,
    lastChangedBy: null,
    isInactive: null,
    inactivatedDate: null
  };

  tableData: any = [
    [
      {
        "paramid": 1,
        "spid": 0,
        "ParamType": "000",
        "ParamDesc": "State codes",
        "paramvalue": "001",
        "addlparamvalue1": null,
        "addlparamvalue2": null,
        "addlparamvalue3": null,
        "addlparamvalue4": null,
        "addlparamvalue5": null,
        "sortseq": 1,
        "inactivecodeflag": null,
        "inactivedate": null,
        "createdby": "k@k.com",
        "datecreated": "2025-04-30T10:57:49.000Z",
        "lastupdatedby": null,
        "lastupdateddate": null
      },
      {
        "paramid": 3,
        "spid": 0,
        "ParamType": "000",
        "ParamDesc": "Country codes",
        "paramvalue": "002",
        "addlparamvalue1": null,
        "addlparamvalue2": null,
        "addlparamvalue3": null,
        "addlparamvalue4": null,
        "addlparamvalue5": null,
        "sortseq": 2,
        "inactivecodeflag": null,
        "inactivedate": null,
        "createdby": "k@k.com",
        "datecreated": "2025-04-30T11:10:10.000Z",
        "lastupdatedby": null,
        "lastupdateddate": null
      },
      {
        "paramid": 1012,
        "spid": 0,
        "ParamType": "000",
        "ParamDesc": "Bond sureties",
        "paramvalue": "003",
        "addlparamvalue1": null,
        "addlparamvalue2": null,
        "addlparamvalue3": null,
        "addlparamvalue4": null,
        "addlparamvalue5": null,
        "sortseq": 3,
        "inactivecodeflag": null,
        "inactivedate": null,
        "createdby": "k@k.com",
        "datecreated": "2025-05-06T16:23:44.000Z",
        "lastupdatedby": null,
        "lastupdateddate": null
      }
    ],
    [
      {
        "paramid": 6,
        "spid": 0,
        "ParamType": "001",
        "ParamDesc": "Alberta",
        "paramvalue": "AB",
        "addlparamvalue1": "CA",
        "addlparamvalue2": null,
        "addlparamvalue3": null,
        "addlparamvalue4": null,
        "addlparamvalue5": null,
        "sortseq": 1,
        "inactivecodeflag": "N",
        "inactivedate": null,
        "createdby": "k@k.com",
        "datecreated": "2025-04-30T11:46:20.000Z",
        "lastupdatedby": "k@k.com",
        "lastupdateddate": "2025-04-30T12:45:49.000Z"
      },
      {
        "paramid": 1015,
        "spid": 0,
        "ParamType": "001",
        "ParamDesc": "Quebec",
        "paramvalue": "QC",
        "addlparamvalue1": "CA",
        "addlparamvalue2": null,
        "addlparamvalue3": null,
        "addlparamvalue4": null,
        "addlparamvalue5": null,
        "sortseq": 1,
        "inactivecodeflag": "N",
        "inactivedate": null,
        "createdby": "k@k.com",
        "datecreated": "2025-07-19T11:35:17.000Z",
        "lastupdatedby": "k@k.com",
        "lastupdateddate": "2025-07-19T11:38:34.000Z"
      }
    ]
  ];

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
        paramType: ['', [Validators.required, Validators.maxLength(50)]],
        paramValue: ['', [Validators.required, Validators.maxLength(50)]],
        paramDescription: ['', [Validators.required, Validators.maxLength(50)]],
        Additional_Param_Value1: ['', [Validators.maxLength(100)]],
        Additional_Param_Value2: ['', [Validators.maxLength(100)]],
        Additional_Param_Value3: ['', [Validators.maxLength(100)]],
        Additional_Param_Value4: ['', [Validators.maxLength(100)]],
        Additional_Param_Value5: ['', [Validators.maxLength(100)]],
      };
    }
    else {
      this.formControls = {
        paramDescription: ['', [Validators.required, Validators.maxLength(50)]],
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
    this.currentContactId = null;
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
        this.dataSource.data = this.paramData;
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
    if (this.showInactiveData) {
      this.dataSource.data = this.paramData.filter((data: any) => data?.inactivecodeflag === 'Y');
    } else {
      this.dataSource.data = this.paramData.filter((data: any) => data?.inactivecodeflag === 'N' || data?.inactivecodeflag === null);
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
    this.currentContactId = null;
    this.paramForm.reset();
    this.paramForm.get('paramType')?.setValue(this.paramType);
  }

  onEditParam(param: any): void {
    this.getForm();
    this.paramForm = this.fb.group(this.formControls);

    this.showForm = true;
    this.isEditing = true;
    this.currentParamid = param.paramid;
    this.paramForm.patchValue({
      paramType: param.ParamType,
      paramValue: param.paramvalue,
      paramDescription: param.ParamDesc,
      Additional_Param_Value1: param.addlparamvalue1,
      Additional_Param_Value2: param.addlparamvalue2,
      Additional_Param_Value3: param.addlparamvalue3,
      Additional_Param_Value4: param.addlparamvalue4,
      Additional_Param_Value5: param.addlparamvalue5
    });

    this.paramForm.get('paramType')?.setValue(this.paramType);

    this.contactReadOnlyFields.lastChangedDate = param.lastupdateddate ?? param.datecreated;
    this.contactReadOnlyFields.lastChangedBy = param.lastupdatedby ?? param.createdby;
    this.contactReadOnlyFields.isInactive = param.inactivecodeflag === 'N' || !param.inactivecodeflag ? 'Yes' : 'No';
    this.contactReadOnlyFields.inactivatedDate = param.inactivedate;
  }

  saveRecord(): void {
    if (this.paramForm.invalid) {
      this.paramForm.markAllAsTouched();
      return;
    }

    const paramDetailData: any = this.table_mode === 'PARAM-RECORD' && this.isEditing && this.currentParamid
      ? {
        
      } : {};

    console.log("form : ", paramDetailData);


    if (this.table_mode === 'PARAM-RECORD' && this.isEditing && this.currentParamid) {
      paramDetailData.P_PARAMID = this.currentParamid;
    }

    const paramTableData: ParamTableForm = {
      P_TABLEFULLDESC: this.paramForm.value.paramDescription,
    };

    const saveObservable = this.table_mode === 'TABLE-RECORD' ?
      this.paramService.CreateTableRecord(paramTableData)
      :
      this.isEditing
        ? this.paramService.UpdateParamRecord(paramDetailData)
        : this.paramService.CreateParamRecord(paramDetailData);

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

}
