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
import { ParamValue } from '../../core/models/param/paramValue';
import { ApiErrorHandlerService } from '../../core/services/common/api-error-handler.service';
import { NotificationService } from '../../core/services/common/notification.service';

@Component({
  selector: 'app-param-table',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule, MatSlideToggleModule],
  templateUrl: './param-table.component.html',
  styleUrl: './param-table.component.scss'
})
export class ParamTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  @Input() table_mode: 'TABLE-RECORD' | 'PARAM-RECORD' = 'TABLE-RECORD'

  isLoading: boolean = false;
  userPreferences: UserPreferences;
  paramType: string | null = null;
  paramData: any = [];
  showInactiveData: boolean = false;
  isEditing: boolean = false;
  showForm: boolean = true;
  currentContactId: number|null = 0;
  contactReadOnlyFields:any = {}

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
  contactForm: FormGroup;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.data = this.paramData;
  }

  displayedColumns: string[] = ['ParamType', 'ParamDesc', 'paramvalue', 'addlparamvalue1', 'addlparamvalue2', 'addlparamvalue3',
    'addlparamvalue4', 'addlparamvalue5', 'actions'];

  constructor(
    private userPrefenceService: UserPreferencesService,
    private navigationService: NavigationService,
    private fb: FormBuilder,
  ) {
    this.userPreferences = this.userPrefenceService.getPreferences();
    this.contactForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      middleInitial: ['', [Validators.maxLength(1)]],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      mobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      fax: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      // defaultContact: [false]
    });
  }

  cancelEdit(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentContactId = null;
    this.contactForm.reset();
  }

  saveContact(){}

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.paramType = this.route.snapshot.paramMap.get('id');

    console.log(this.paramType);

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

    // this.paramData = this.tableData[0]
    // this.dataSource.data = this.paramData
    // this.renderParamData();
    // this.isLoading = false
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

  onRecordClick(id: string): void {
    this.navigationService.navigate(['param-record', id]);
  }
  onEditParam(): void {

  }

}
