import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../common/user.service";
import { ParamValue } from "../../models/param/paramValue";
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
}