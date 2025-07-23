import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../common/user.service";
import { ParamStatusForm, ParamTableForm, ParamValue, ParamValueForm } from "../../models/param/paramValue";
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
            PARAMID: paramValue.PARAMID,
            SPID: paramValue.SPID,
            PARAMTYPE: paramValue.PARAMTYPE,
            PARAMDESC: paramValue.PARAMDESC,
            PARAMVALUE: paramValue.PARAMVALUE,
            ADDLPARAMVALUE1: paramValue.ADDLPARAMVALUE1,
            ADDLPARAMVALUE2: paramValue.ADDLPARAMVALUE2,
            ADDLPARAMVALUE3: paramValue.ADDLPARAMVALUE3,
            ADDLPARAMVALUE4: paramValue.ADDLPARAMVALUE4,
            ADDLPARAMVALUE5: paramValue.ADDLPARAMVALUE5,
            SORTSEQ: paramValue.SORTSEQ,
            INACTIVECODEFLAG: paramValue.INACTIVECODEFLAG,
            INACTIVEDATE: paramValue.INACTIVEDATE,
            CREATEDBY: paramValue.CREATEDBY,
            DATECREATED: paramValue.DATECREATED,
            LASTUPDATEDBY: paramValue.LASTUPDATEDBY,
            LASTUPDATEDDATE: paramValue.LASTUPDATEDDATE,
            ERRORMESG: paramValue.ERRORMESG
        }));
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

    InActivateParamRecord(PARAMID: number) {

        const data: ParamStatusForm = {
            P_PARAMID: PARAMID,
            P_USERID: this.userService.getSafeUser()
        }
        return this.http.patch(`${this.apiUrl}/${this.apiDb}/InActivateParamRecord`, data);
    }

    ReActivateParamRecord(PARAMID: number) {
        const data: ParamStatusForm = {
            P_PARAMID: PARAMID,
            P_USERID: this.userService.getSafeUser()
        }
        return this.http.patch(`${this.apiUrl}/${this.apiDb}/ReActivateParamRecord`, data);
    }
}