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