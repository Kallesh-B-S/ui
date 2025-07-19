import { Component, ViewChild } from '@angular/core';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { UserPreferences } from '../core/models/user-preference';
import { UserPreferencesService } from '../core/services/user-preference.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-param-table',
  imports: [AngularMaterialModule, ReactiveFormsModule, CommonModule, MatSlideToggleModule],
  templateUrl: './param-table.component.html',
  styleUrl: './param-table.component.scss'
})
export class ParamTableComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading: boolean = false;
  userPreferences: UserPreferences;

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

  dataSource = new MatTableDataSource<any>(this.tableData[0]);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  displayedColumns: string[] = ['ParamType', 'ParamDesc', 'paramvalue', 'addlparamvalue1', 'addlparamvalue2', 'addlparamvalue3',
    'addlparamvalue4', 'addlparamvalue5', 'actions'];

  constructor(
    private userPrefenceService: UserPreferencesService,
  ) {
    this.userPreferences = this.userPrefenceService.getPreferences();
  }

  toggleShowInactiveHolders(): void {
    // this.showInactiveHolders = !this.showInactiveHolders;
    // this.renderHolders();
  }
}
