import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { BasicDetail } from '../models/service-provider/basic-detail';
import { filter, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BasicDetailService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService) { }

  getBasicDetailsById(id: number): BasicDetail | any {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetSelectedServiceprovider?p_spid=${id}`).pipe(
      filter(response => response.length > 0),
      map(response => this.mapToBasicDetail(response?.[0])));
  }

  private mapToBasicDetail(basicDetails: any): BasicDetail {
    return {
      spid: basicDetails.SPID,
      companyName: basicDetails.NAMEOF,
      lookupCode: basicDetails.LOOKUPCODE,
      address1: basicDetails.ADDRESS1,
      address2: basicDetails.ADDRESS2,
      city: basicDetails.CITY,
      state: basicDetails.STATE,
      country: basicDetails.COUNTRY,
      issuingRegion: basicDetails.ISSUINGREGION,
      replacementRegion: basicDetails.REPLACEMENTREGION,
      zip: basicDetails.ZIP,
      cargoSurety: basicDetails.CARGOSURETY,
      cargoPolicyNo: basicDetails.CARGOPOLICYNO,
      bondSurety: basicDetails.BONDSURETY
    };
  }

  createBasicDetails(data: BasicDetail): Observable<any> {

    const basicDetails = {
      p_name: data.companyName,
      p_lookupcode: data.lookupCode,
      p_address1: data.address1,
      p_address2: data.address2,
      p_city: data.city,
      p_state: data.state,
      p_zip: data.zip,
      p_country: data.country,
      p_issuingregion: data.issuingRegion,
      p_replacementregion: data.replacementRegion,
      p_bondsurety: data.bondSurety,
      p_cargopolicyno: data.cargoPolicyNo,
      p_cargosurety: data.cargoSurety,
      p_user_id: this.userService.getUser(),
    }

    return this.http.post(`${this.apiUrl}/${this.apiDb}/InsertNewServiceProvider`, basicDetails);
  }

  updateBasicDetails(id: number, data: BasicDetail): Observable<any> {

    const basicDetails = {
      p_spid: id,
      p_name: data.companyName,
      p_lookupcode: data.lookupCode,
      p_address1: data.address1,
      p_address2: data.address2,
      p_city: data.city,
      p_state: data.state,
      p_zip: data.zip,
      p_country: data.country,
      p_issuingregion: data.issuingRegion,
      p_replacementregion: data.replacementRegion,
      p_bondsurety: data.bondSurety,
      p_cargopolicyno: data.cargoPolicyNo,
      p_cargosurety: data.cargoSurety,
      p_user_id: this.userService.getUser(),
    }

    return this.http.put(`${this.apiUrl}/${this.apiDb}/UpdateServiceProvider`, basicDetails);
  }
}
