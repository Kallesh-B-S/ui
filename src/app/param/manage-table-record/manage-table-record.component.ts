import { Component } from '@angular/core';
import { ParamTableComponent } from '../table/param-table.component';
import { TABLE_MODE } from '../../core/models/param/types';

@Component({
  selector: 'app-manage-table-record',
  imports: [ParamTableComponent],
  templateUrl: './manage-table-record.component.html',
  styleUrl: './manage-table-record.component.scss'
})
export class ManageTableRecordComponent {
  table_mode: TABLE_MODE = 'TABLE-RECORD'


}
