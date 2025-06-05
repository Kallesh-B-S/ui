import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService) { }

  getCarnetSummaryData(): Observable<any> {
    const userid = this.userService.getUser();
    return this.http.get(`${this.apiUrl}/${this.apiDb}/GetCarnetSummaryData/${userid}`);
  }

  getCarnetDataByStatus(spid: number, carnetStatus: string): Observable<any> {
    const userid = this.userService.getUser();
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetCarnetDetailsbyCarnetStatus/${spid}/${userid}/${carnetStatus}`).pipe(
      map(response => this.mapToCarnetData(response)));
  }

  private mapToCarnetData(data: any[]): any[] {
    return data.map(item => ({
      applicationName: item.APPLICATIONNAME,
      holderName: item.HOLDERNAME,
      carnetNumber: item.CARNETNO,
      usSets: item.USSETS,
      foreignSets: item.FOREIGNSETS,
      transitSets: item.TRANSITSETS,
      carnetValue: item.CARNETVALUE,
      issueDate: item.ISSUEDATE || null,
      expiryDate: item.EXPDATE || null,
      orderType: item.ORDERTYPE,
      carnetStatus: item.CARNETSTATUS
    }));
  }
}
