import { Component, inject } from '@angular/core';
import { TABLE_MODE } from '../../core/models/param/types';
import { ParamTableComponent } from '../table/param-table.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-manage-param-record',
  imports: [ParamTableComponent],
  templateUrl: './manage-param-record.component.html',
  styleUrl: './manage-param-record.component.scss'
})
export class ManageParamRecordComponent {
  table_mode: TABLE_MODE = 'PARAM-RECORD'
  paramHeading: string = '';

  private route = inject(ActivatedRoute);

  ngOnInit() {

    const param = this.route.snapshot.queryParamMap.get('param');
    console.log("--p-- : ",param);
    
    this.paramHeading = param || '';

  }
}
