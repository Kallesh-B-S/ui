import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CounterfoilFee } from '../../models/service-provider/counterfoil-fee';
import { CommonService } from '../common/common.service';
import { UserService } from '../common/user.service';

@Injectable({
  providedIn: 'root'
})
export class CounterfoilFeeService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  private http = inject(HttpClient);
  private userService = inject(UserService);
  private commonService = inject(CommonService);
  
  getCounterfoils(spid: number): Observable<CounterfoilFee[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetCfFeeRates/${spid}/ACTIVE`).pipe(
      map(response => this.mapToCounterFoilFee(response)));
  }

  private mapToCounterFoilFee(data: any[]): CounterfoilFee[] {
    return data.map(item => ({
      id: item.CFFEESETUPID,
      spid: item.SPID,
      startSets: item.STARTSETS,
      endSets: item.ENDSETS,
      customerType: item.CUSTOMERTYPE,
      carnetType: item.CARNETTYPE,
      effectiveDate: item.EFFDATE,
      rate: item.RATE,
      createdBy: item.CREATEDBY || null,
      dateCreated: item.DATECREATED || null
    }));
  }

  addCounterfoil(spid: number, data: CounterfoilFee): Observable<any> {

    const counterfoilFee = {
      P_SPID: spid,
      P_STARTSETS: data.startSets,
      P_ENDSETS: data.endSets,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_CUSTOMERTYPE: data.customerType,
      P_CARNETTYPE: data.carnetType,
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.post<any>(`${this.apiUrl}/${this.apiDb}/CreateCfFee`, counterfoilFee);
  }

  updateCounterfoil(id: number, data: CounterfoilFee): Observable<any> {

    const counterfoilFee = {
      P_CFFEESETUPID: id,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.patch<any>(`${this.apiUrl}/${this.apiDb}//UpdateCfFee`, counterfoilFee);
  }

  // deleteCounterfoil(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${this.apiDb}/InactivateSPContact/${id}`);
  // }
}
