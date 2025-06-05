import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { map, Observable } from 'rxjs';
import { CarnetSequence } from '../models/service-provider/carnet-sequence';

@Injectable({
  providedIn: 'root'
})
export class CarnetSequenceService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService) { }

  getCarnetSequenceById(id: number): Observable<CarnetSequence[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetCarnetSequence?p_spid=${id}`).pipe(
      map(response => this.mapToCarnetSequence(response)));
  }

  private mapToCarnetSequence(data: any[]): CarnetSequence[] {
    return data.map(item => ({
      spid: item.SPID,
      region: item.REGIONID,
      carnetType: item.CARNETTYPE,
      startNumber: item.STARTNUMBER,
      endNumber: item.ENDNUMBER,
      lastNumber: item.LASTNUMBER
    }));
  }

  createCarnetSequence(data: CarnetSequence): Observable<any> {

    const carnetSequence = {
      p_spid: data.spid,
      p_regionid: data.region,
      p_startnumber: data.startNumber,
      p_endnumber: data.endNumber,
      p_carnettype: data.carnetType
    }

    return this.http.post(`${this.apiUrl}/${this.apiDb}/CreateCarnetSequence`, carnetSequence);
  }
}
