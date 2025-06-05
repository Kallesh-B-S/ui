import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AngularMaterialModule } from '../../shared/module/angular-material.module';
import { Router } from '@angular/router';
import { CarnetStatus } from '../../core/models/carnet-status';

@Component({
  selector: 'app-chart',
  imports: [CommonModule, AngularMaterialModule, BaseChartDirective],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() chartData: any[] = [];
  @Input() carnetStatuses: CarnetStatus[] = [];
  @Output() carnetStatusData = new EventEmitter<any>();

  constructor(private router: Router) { }

  navigateToManageProvider(spid: number): void {
    this.router.navigate(['/service-provider', spid]);
  }

  public chartClicked(event: any, chartIndex: number): void {
    const active = event.active;
    if (active?.length) {
      const dataIndex = active[0].index;
      const chart = this.chartConfigs[chartIndex];

      const spid = chart.spid as number;
      const carnetStatus = this.carnetStatuses.find(t => t.name === chart.data?.labels?.[dataIndex]);

      if (carnetStatus !== undefined) {
        this.carnetStatusData.emit({
          spid: spid,
          carnetStatus: carnetStatus.value
        });
      }
    }
  }

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#333',
          font: {
            size: 14
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw as number || 0;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    }
  };

  public chartType: ChartType = 'pie';
  public chartPlugins = [];

  public chartConfigs: {
    title: string,
    spid: number,
    data: ChartData<'pie'>;
    colors: string[];
    options: ChartConfiguration['options'];
  }[] = [];

  ngOnChanges() {
    this.processChartData();
  }

  private processChartData(): void {
    this.chartConfigs = this.chartData.map(provider => {
      const statusColors = provider.CARNETSTATUS.map((status: string) => {
        const carnetStatus = this.carnetStatuses.find(t => t.value === status);
        return carnetStatus ? carnetStatus.color : '#9E9E9E';
      });

      const labels = provider.CARNETSTATUS.map((status: string) => {
        const carnetStatus = this.carnetStatuses.find(t => t.value === status);
        return carnetStatus!.name;
      });

      return {
        title: provider.Service_Provider_Name,
        spid: provider.SPID,
        data: {
          labels: labels,
          datasets: [{
            data: provider.Carnet_Count,
            backgroundColor: statusColors,
            hoverBackgroundColor: statusColors.map((c: any) => this.adjustBrightness(c, -20)),
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        colors: statusColors,
        options: this.chartOptions
      };
    });
  }

  private adjustBrightness(color: string, percent: number): string {
    // Helper function to adjust color brightness
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return '#' + (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
}