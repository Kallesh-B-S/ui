import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { SecurityDeposit } from '../models/service-provider/security-deposit';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SecurityDepositService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService, private commonService: CommonService) { }

  getSecurityDeposits(spid: number): Observable<SecurityDeposit[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetBondRates?P_SPID=${spid}&P_ACTIVE_INACTIVE=ACTIVE`).pipe(
      map(response => this.mapToSecurityDeposit(response)));
  }

  private mapToSecurityDeposit(data: any[]): SecurityDeposit[] {
    return data.map(item => ({
      securityDepositId: item.BONDRATESETUPID,
      holderType: item.HOLDERTYPE,
      uscibMember: item.USCIBMEMBERFLAG,
      specialCommodity: item.SPCLCOMMODITY,
      specialCountry: item.SPCLCOUNTRY,
      rate: item.RATE,
      effectiveDate: item.EFFDATE,
      spid: item.SPID,
      createdBy: item.CREATEDBY || null,
      dateCreated: item.DATECREATED || null
    }));
  }

  createSecurityDeposit(spid: number, data: SecurityDeposit): Observable<any> {

    const securityDeposit = {
      P_SPID: spid,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_HOLDERTYPE: data.holderType,
      P_USCIBMEMBERFLAG: data.uscibMember ? 'Y' : 'N',
      P_SPCLCOMMODITY: data.specialCommodity,
      P_SPCLCOUNTRY: data.specialCountry,
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.post<any>(`${this.apiUrl}/${this.apiDb}/CreateBondRate`, securityDeposit);
  }

  updateSecurityDeposit(id: number, data: SecurityDeposit): Observable<any> {

    const securityDeposit = {
      P_BONDRATESETUPID: id,
      P_EFFDATE: this.commonService.formatUSDate(data.effectiveDate),
      P_RATE: data.rate,
      P_USERID: this.userService.getUser()
    }

    return this.http.patch<any>(`${this.apiUrl}/${this.apiDb}/UpdateBondRate`, securityDeposit);
  }

  // deleteSecurityDeposit(id: string): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}/${this.apiDb}/InactivateSPContact/${id}`);
  // }
}
