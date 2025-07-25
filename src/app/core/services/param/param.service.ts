import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { UserService } from "../common/user.service";
import { ParamProperties } from "../../models/param/parameters";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ParamService {
    private apiUrl = environment.apiUrl;
    private apiDb = environment.apiDb;

    private http = inject(HttpClient);
    private userService = inject(UserService);

    getParameters(P_PARAMTYPE: string): Observable<ParamProperties[]> {
        return this.http.get<any[]>(`${this.apiUrl}/${this.apiDb}/GetParamValues?P_SPID=${this.userService.getUserSpid()}&P_PARAMTYPE=${P_PARAMTYPE}`).pipe(
            map(response => this.mapToParamValue(response))
        )
    }

    private mapToParamValue(data: any[]): ParamProperties[] {
        return data.map((paramValue: any) => ({
            paramId: paramValue.PARAMID,
            spid: paramValue.SPID,
            paramType: paramValue.PARAMTYPE,
            paramDesc: paramValue.PARAMDESC,
            paramValue: paramValue.PARAMVALUE,
            addlParamValue1: paramValue.ADDLPARAMVALUE1,
            addlParamValue2: paramValue.ADDLPARAMVALUE2,
            addlParamValue3: paramValue.ADDLPARAMVALUE3,
            addlParamValue4: paramValue.ADDLPARAMVALUE4,
            addlParamValue5: paramValue.ADDLPARAMVALUE5,
            sortSeq: paramValue.SORTSEQ,
            inactiveCodeFlag: paramValue.INACTIVECODEFLAG,
            inactiveDate: paramValue.INACTIVEDATE,
            createdBy: paramValue.CREATEDBY,
            dateCreated: paramValue.DATECREATED,
            lastUpdatedBy: paramValue.LASTUPDATEDBY,
            lastUpdatedDate: paramValue.LASTUPDATEDDATE,
            errorMesg: paramValue.ERRORMESG,
        }));

    }

    createTableRecord(description: string): Observable<any> {

        const paramDetails = {
            P_TABLEFULLDESC: description,
            P_USERID: this.userService.getUser(),
        };

        return this.http.post(`${this.apiUrl}/${this.apiDb}/CreateTableRecord`, paramDetails);
    }

    createParamRecord(data: ParamProperties): Observable<any> {

        const paramDetails = {
            p_spid: this.userService.getUserSpid(),
            P_PARAMTYPE: data.paramType,
            P_PARAMDESC: data.paramDesc,
            P_PARAMVALUE: data.paramValue,
            P_ADDLPARAMVALUE1: data.addlParamValue1,
            P_ADDLPARAMVALUE2: data.addlParamValue2,
            P_ADDLPARAMVALUE3: data.addlParamValue3,
            P_ADDLPARAMVALUE4: data.addlParamValue4,
            P_ADDLPARAMVALUE5: data.addlParamValue5,
            P_SORTSEQ: data.sortSeq,
            P_USERID: this.userService.getUser(),
        };

        return this.http.post(`${this.apiUrl}/${this.apiDb}/CreateParamRecord`, paramDetails);
    }

    updateParamRecord(data: ParamProperties): Observable<any> {

        const paramDetails = {
            P_SPID: this.userService.getUserSpid(),
            P_PARAMID: data.paramId,
            P_PARAMDESC: data.paramDesc,
            P_ADDLPARAMVALUE1: data.addlParamValue1,
            P_ADDLPARAMVALUE2: data.addlParamValue2,
            P_ADDLPARAMVALUE3: data.addlParamValue3,
            P_ADDLPARAMVALUE4: data.addlParamValue4,
            P_ADDLPARAMVALUE5: data.addlParamValue5,
            P_SORTSEQ: data.sortSeq,
            P_USERID: this.userService.getUser(),
        };

        console.log(paramDetails);

        return this.http.patch(`${this.apiUrl}/${this.apiDb}/UpdateParamRecord`, paramDetails);
    }

    inActivateParamRecord(paramId: number) {

        const data = {
            P_PARAMID: paramId,
            P_USERID: this.userService.getSafeUser()
        }
        return this.http.patch(`${this.apiUrl}/${this.apiDb}/InActivateParamRecord`, data);
    }

    reActivateParamRecord(paramId: number) {
        const data = {
            P_PARAMID: paramId,
            P_USERID: this.userService.getSafeUser()
        }
        return this.http.patch(`${this.apiUrl}/${this.apiDb}/ReActivateParamRecord`, data);
    }
}