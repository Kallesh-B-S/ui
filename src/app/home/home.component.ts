import { Component, inject, ViewChild } from '@angular/core';
import { HomeService } from '../core/services/home.service';
import { AngularMaterialModule } from '../shared/module/angular-material.module';
import { ChartComponent } from './chart/chart.component';
import { RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UserPreferences } from '../core/models/user-preference';
import { UserPreferencesService } from '../core/services/user-preference.service';
import { CommonModule } from '@angular/common';
import { CustomPaginator } from '../shared/custom-paginator';
import { CarnetStatus } from '../core/models/carnet-status';
import { ApiErrorHandlerService } from '../core/services/common/api-error-handler.service';
import { CommonService } from '../core/services/common/common.service';
import { NotificationService } from '../core/services/common/notification.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-home',
  imports: [AngularMaterialModule, ChartComponent, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginator }],
})
export class HomeComponent {
  carnetData: any[] = [];
  isLoading = false;
  showTable = false;
  userPreferences: UserPreferences;
  carnetStatuses: CarnetStatus[] = [];

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }

  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  displayedColumns: string[] = ['applicationName', 'holderName', 'carnetNumber', 'usSets', 'foreignSets', 'transitSets', 'carnetValue', 'issueDate', 'expiryDate', 'orderType', 'carnetStatus'];

  private homeService = inject(HomeService);
  private errorHandler = inject(ApiErrorHandlerService);
  private notificationService = inject(NotificationService);
  private commonService = inject(CommonService);

  constructor(userPrefenceService: UserPreferencesService) {
    this.userPreferences = userPrefenceService.getPreferences();
  }

  ngOnInit(): void {
    this.loadCarnetStatuses();
    this.loadCarnetData();
  }

  loadCarnetStatuses(): void {
    this.commonService.getCarnetStatuses().subscribe({
      next: (carnetStatuses) => {
        this.carnetStatuses = carnetStatuses;
      },
      error: (error) => {
        console.error('Error loading carnet status:', error);
      }
    });
  }

  loadCarnetData(): void {
    this.isLoading = true;
    this.homeService.getCarnetSummaryData().subscribe({
      next: (data) => {
        this.carnetData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading carnet data:', error);
        this.isLoading = false;
      }
    });
  }

  onCarnetStatusClick(event: any): void {
    this.isLoading = true;
    this.showTable = false;
    this.homeService.getCarnetDataByStatus(event.spid, event.carnetStatus).subscribe({
      next: (carnetDetails) => {
        this.isLoading = false;
        this.showTable = true;
        this.dataSource.data = carnetDetails;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => {
        let errorMessage = this.errorHandler.handleApiError(error, 'Failed to load carnet data for the selected status');
        this.notificationService.showError(errorMessage);
        this.isLoading = false;
        console.error('Error loading carnet data for the selected status:', error);
      }
    });
  }

  exportData() {
    try {
      // Prepare worksheet data
      const worksheetData = this.prepareDownloadData();

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Carnet Data');

      // Generate Excel file
      const fileName = `carnet_data_${new Date().toISOString()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error downloading goods items:', error);
      this.notificationService.showError('Failed to download Excel file');
    }
  }

  prepareDownloadData(): any[] {
    return this.dataSource.data.map(item => ({
      'Application Name': item.applicationName,
      'Holder Name': item.holderName,
      'Carnet Number': item.carnetNumber,
      'US Sets': item.usSets,
      'Foreign Sets': item.foreignSets,
      'Transit Sets': item.transitSets,
      'Carnet Value': item.carnetValue,
      'Issue Date': item.issueDate ? new Date(item.issueDate).toLocaleDateString() : '',
      'Expiry Date': item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '',
      'Order Type': item.orderType,
      'Carnet Status': this.getCarnetStatusLabel(item.carnetStatus)
    }));
  }

  getCarnetStatusLabel(value: string): string {
    const carnetStatus = this.carnetStatuses.find(t => t.value === value);
    return carnetStatus ? carnetStatus.name : value;
  }
}