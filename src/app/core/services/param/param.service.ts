import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../common/user.service";
import { ParamTableForm, ParamValue, ParamValueForm } from "../../models/param/paramValue";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ParamService {
    private apiUrl = environment.apiUrl;
    private apiDb = environment.apiDb;

    private http = inject(HttpClient);
    private userService = inject(UserService);

    getParamValues(P_PARAMTYPE: string): Observable<ParamValue[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetParamValues?P_SPID=${this.userService.getUserSpid()}&P_PARAMTYPE=${P_PARAMTYPE}`).pipe(
            map(response => this.mapToParamValue(response))
        )
    }

    private mapToParamValue(data: any[]): ParamValue[] {
        return data.map((paramValue: ParamValue) => ({
            paramid: paramValue.paramid,
            spid: paramValue.spid,
            ParamType: paramValue.ParamType,
            ParamDesc: paramValue.ParamDesc,
            paramvalue: paramValue.paramvalue,
            addlparamvalue1: paramValue.addlparamvalue1,
            addlparamvalue2: paramValue.addlparamvalue2,
            addlparamvalue3: paramValue.addlparamvalue3,
            addlparamvalue4: paramValue.addlparamvalue4,
            addlparamvalue5: paramValue.addlparamvalue5,
            sortseq: paramValue.sortseq,
            inactivecodeflag: paramValue.inactivecodeflag,
            inactivedate: paramValue.inactivedate,
            createdby: paramValue.createdby,
            datecreated: paramValue.datecreated,
            lastupdatedby: paramValue.lastupdatedby,
            lastupdateddate: paramValue.lastupdateddate
        }))
    }

    CreateTableRecord(data: ParamTableForm): Observable<any> {

        const paramDetails = {
            P_TABLEFULLDESC: data.P_TABLEFULLDESC,
            P_USERID: this.userService.getUser(),
        };

        return this.http.post(`${this.apiUrl}/${this.apiDb}/CreateTableRecord`, paramDetails);
    }

    CreateParamRecord(data: ParamValueForm): Observable<any> {

        const paramDetails = {
            p_spid: this.userService.getUserSpid(),
            P_PARAMTYPE: data.P_PARAMTYPE,
            P_PARAMDESC: data.P_PARAMDESC,
            P_PARAMVALUE: data.P_PARAMVALUE,
            P_ADDLPARAMVALUE1: data.P_ADDLPARAMVALUE1,
            P_ADDLPARAMVALUE2: data.P_ADDLPARAMVALUE2,
            P_ADDLPARAMVALUE3: data.P_ADDLPARAMVALUE3,
            P_ADDLPARAMVALUE4: data.P_ADDLPARAMVALUE4,
            P_ADDLPARAMVALUE5: data.P_ADDLPARAMVALUE5,
            P_SORTSEQ: data.P_SORTSEQ,
            P_USERID: this.userService.getUser(),
        };

        return this.http.post(`${this.apiUrl}/${this.apiDb}/CreateParamRecord`, paramDetails);
    }

    UpdateParamRecord(data: ParamValueForm): Observable<any> {

        const paramDetails = {
            P_SPID: this.userService.getUserSpid(),
            P_PARAMID: data.P_PARAMID,
            P_PARAMDESC: data.P_PARAMDESC,
            P_ADDLPARAMVALUE1: data.P_ADDLPARAMVALUE1,
            P_ADDLPARAMVALUE2: data.P_ADDLPARAMVALUE2,
            P_ADDLPARAMVALUE3: data.P_ADDLPARAMVALUE3,
            P_ADDLPARAMVALUE4: data.P_ADDLPARAMVALUE4,
            P_ADDLPARAMVALUE5: data.P_ADDLPARAMVALUE5,
            P_SORTSEQ: data.P_SORTSEQ,
            P_USERID: this.userService.getUser(),
        };

        return this.http.patch(`${this.apiUrl}/${this.apiDb}/UpdateParamRecord`, paramDetails);
    }

    InActivateParamRecord() { }

    ReActivateParamRecord() { }

    updateBasicDetails(id: number, data: any): Observable<any> {

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