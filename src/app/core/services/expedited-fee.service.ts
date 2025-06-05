import { Injectable } from '@angular/core';
import { ExpeditedFee } from '../models/service-provider/expedited-fee';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ExpeditedFeeService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService, private commonService: CommonService) { }

  getExpeditedFees(spid: number): Observable<ExpeditedFee[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetEfFeeRates?P_SPID=${spid}&P_ACTIVE_INACTIVE=ACTIVE`).pipe(
      map(response => this.mapToExpeditedFee(response)));
  }

  private mapToExpeditedFee(data: any[]): ExpeditedFee[] {
    return data.map(item => ({
      expeditedFeeId: item.EXPFEESETUPID,
      customerType: item.CUSTOMERTYPE,
      deliveryType: item.DELIVERYTYPE,
      startTime: item.STARTTIME,
      endTime: item.ENDTIME,
      timeZone: item.TIMEZONE,
      fee: item.FEES,
      effectiveDate: item.EFFDATE,
      spid: item.SPID,
      createdBy: item.CREATEDBY || null,
      dateCreated: item.DATECREATED || null
    }));
  }

  createExpeditedFee(spid: number, data: ExpeditedFee): Observable<any> {

    const expeditedFee = {
      P_SPID: spid,
      P_CUSTOMERTYPE: data.customerType,
      P_DELIVERYTYPE: data.deliveryType,
      P_TIMEZONE: data.timeZone,
      P_STARTTIME: +data.startTime,
      P_ENDTIME: +data.endTime,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_FEES: data.fee,
      P_USERID: this.userService.getUser()
    }

    return this.http.post<any>(`${this.apiUrl}/${this.apiDb}/CreateEfFee`, expeditedFee);
  }

  updateExpeditedFee(id: number, data: ExpeditedFee): Observable<any> {

    const expeditedFee = {
      P_EFFEESETUPID: id,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_FEES: data.fee,
      P_USERID: this.userService.getUser()
    }

    return this.http.patch<any>(`${this.apiUrl}/${this.apiDb}//UpdateEfFee`, expeditedFee);
  }

  // deleteExpeditedFee(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${this.apiDb}/InactivateSPContact/${id}`);
  // }

}
