import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Contact } from '../models/service-provider/contact';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;
  private apiDb = environment.apiDb;

  constructor(private http: HttpClient, private userService: UserService) { }

  getContactsById(id: number): Observable<Contact[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetSPAllContacts?p_SPid=${id}`).pipe(
      map(response => this.mapToContacts(response)));
  }

  private mapToContacts(data: any[]): Contact[] {
    return data.map(contact => ({
      spContactId: contact.SPCONTACTID,
      serviceProviderId: contact.SPID,
      defaultContact: contact.DEFCONTACTFLAG === 'Y',
      firstName: contact.FIRSTNAME,
      lastName: contact.LASTNAME,
      title: contact.TITLE,
      phone: contact.PHONENO,
      mobile: contact.MOBILENO,
      fax: contact.FAXNO || null,
      email: contact.EMAILADDRESS,
      middleInitial: contact.MIDDLEINITIAL || null,
      createdBy: contact.CREATEDBY || null,
      dateCreated: contact.DATECREATED || null,
      lastUpdatedBy: contact.LASTUPDATEDBY || null,
      lastUpdatedDate: contact.LASTUPDATEDDATE || null,
      isInactive: contact.INACTIVEFLAG === 'Y' || false,
      inactivatedDate: contact.INACTIVEDATE || null
    }));
  }

  createContact(spid: number, data: Contact): Observable<any> {

    const contact = {
      p_spid: spid,
      p_defcontactflag: data.defaultContact ? 'Y' : 'N',
      p_firstname: data.firstName,
      p_lastname: data.lastName,
      P_MIDDLEINITIAL: data.middleInitial,
      p_title: data.title,
      p_phoneno: data.phone,
      p_mobileno: data.mobile,
      p_faxno: data.fax,
      p_emailaddress: data.email,
      p_user_id: this.userService.getUser()
    }

    return this.http.post(`${this.apiUrl}/${this.apiDb}/InsertSPContacts`, contact);
  }

  updateContact(spContactId: number, data: Contact): Observable<any> {

    const contact = {
      p_spcontactid: spContactId,
      p_firstname: data.firstName,
      p_lastname: data.lastName,
      P_MIDDLEINITIAL: data.middleInitial,
      p_title: data.title,
      p_phoneno: data.phone,
      p_mobileno: data.mobile,
      p_faxno: data.fax,
      p_emailaddress: data.email,
      p_user_id: this.userService.getUser()
    }

    return this.http.put(`${this.apiUrl}/${this.apiDb}/UpdateSPContacts`, contact);
  }

  deleteContact(spContactId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${this.apiDb}/InactivateSPContact?p_spcontactid=${spContactId}`, null);
  }

}
