import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { BasicFee } from '../models/service-provider/basic-fee';
import { map, Observable } from 'rxjs';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class BasicFeeService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService, private commonService: CommonService) { }

  getBasicFees(spid: number): Observable<BasicFee[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetBasicFeeRates?P_SPID=${spid}&P_ACTIVE_INACTIVE=ACTIVE`).pipe(
      map(response => this.mapToBasicFees(response)));
  }

  private mapToBasicFees(data: any[]): BasicFee[] {
    return data.map(item => ({
      basicFeeId: item.BASICFEESETUPID,
      startCarnetValue: item.STARTCARNETVALUE,
      endCarnetValue: item.ENDCARNETVALUE,
      fees: item.FEES,
      effectiveDate: item.EFFDATE,
      createdBy: item.CREATEDBY || null,
      dateCreated: item.DATECREATED || null      
    }));
  }

  createBasicFee(spid: number, fee: BasicFee): Observable<any> {
    const payload = {
      P_SPID: spid,
      P_STARTCARNETVALUE: fee.startCarnetValue,
      P_ENDCARNETVALUE: fee.endCarnetValue,
      P_FEES: fee.fees,
      P_EFFDATE: this.commonService.formatUSDate(fee.effectiveDate),
      P_USERID: this.userService.getUser()
    };

    return this.http.post<any>(`${this.apiUrl}/${this.apiDb}/CreateBasicFee`, payload);
  }
  updateBasicFee(feeId: number, fee: BasicFee): Observable<any> {
    const payload = {
      P_BASICFEESETUPID: feeId,
      P_STARTCARNETVALUE: fee.startCarnetValue,
      P_ENDCARNETVALUE: fee.endCarnetValue,
      P_FEES: fee.fees,
      P_EFFDATE: this.commonService.formatUSDate(fee.effectiveDate),
      P_USERID: this.userService.getUser()
    };

    return this.http.patch<any>(`${this.apiUrl}/${this.apiDb}/UpdateBasicFee`, payload);
  }

  // deleteBasicFee(feeId: number): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}/${this.apiDb}/DeleteBasicFee/${feeId}`, {
  //     params: {
  //       p_userid: this.userService.getUser()
  //     }
  //   });
  // }
}
