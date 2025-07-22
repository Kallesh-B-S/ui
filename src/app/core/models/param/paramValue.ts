export interface ParamValue {
    paramid: number;
    spid: number;
    ParamType: string;
    ParamDesc: string;
    paramvalue: string;
    addlparamvalue1: string;
    addlparamvalue2: string | null;
    addlparamvalue3: string | null;
    addlparamvalue4: string | null;
    addlparamvalue5: string | null;
    sortseq: number;
    inactivecodeflag: null | 'Y' | 'N';
    inactivedate: string | null;
    createdby: string;
    datecreated: string;
    lastupdatedby: string | null;
    lastupdateddate: string | null;
}

export interface ParamValueForm {
    P_SPID?: number;
    P_PARAMTYPE: string;
    P_PARAMID?: number;
    P_PARAMDESC: string;
    P_PARAMVALUE: string;
    P_ADDLPARAMVALUE1: string | null;
    P_ADDLPARAMVALUE2: string | null;
    P_ADDLPARAMVALUE3: string | null;
    P_ADDLPARAMVALUE4: string | null;
    P_ADDLPARAMVALUE5: string | null;
    P_SORTSEQ?: number;
    P_USERID?: string;
}

export interface ParamTableForm {
    P_TABLEFULLDESC: string;
    P_USERID?: string;
}

export interface ParamStatusForm {
    P_PARAMID: number;
    P_USERID: string;
}