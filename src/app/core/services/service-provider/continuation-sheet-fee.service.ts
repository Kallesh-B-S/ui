import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ContinuationSheetFee } from '../../models/service-provider/continuation-sheet-fee';
import { CommonService } from '../common/common.service';
import { UserService } from '../common/user.service';

@Injectable({
  providedIn: 'root'
})
export class ContinuationSheetFeeService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  private http = inject(HttpClient);
  private userService = inject(UserService);
  private commonService = inject(CommonService);

  getContinuationSheets(spid: number): Observable<ContinuationSheetFee[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetCsFeeRates/${spid}/ACTIVE`).pipe(
      map(response => this.mapToContinuationSheetFee(response)));
  }

  private mapToContinuationSheetFee(data: any[]): ContinuationSheetFee[] {
    return data.map(item => ({
      id: item.CSFEESETUPID,
      spid: item.SPID,
      customerType: item.CUSTOMERTYPE,
      carnetType: item.CARNETTYPE,
      effectiveDate: item.EFFDATE,
      rate: item.RATE,
      createdBy: item.CREATEDBY || null,
      dateCreated: item.DATECREATED || null
    }));
  }

  addContinuationSheet(spid: number, data: ContinuationSheetFee): Observable<any> {

    const continuationSheet = {
      P_SPID: spid,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_CUSTOMERTYPE: data.customerType,
      P_CARNETTYPE: data.carnetType,
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.post<any>(`${this.apiUrl}/${this.apiDb}/CreateCsFee`, continuationSheet);
  }

  updateContinuationSheet(id: number, data: ContinuationSheetFee): Observable<any> {

    const continuationSheet = {
      P_CSFEESETUPID: id,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.patch<any>(`${this.apiUrl}/${this.apiDb}/UpdateCsFee`, continuationSheet);
  }

  // deleteContinuationSheet(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${this.apiDb}/InactivateSPContact/${id}`);
  // }

}
