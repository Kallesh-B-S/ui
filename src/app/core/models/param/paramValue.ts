
export interface ParamValue {
  PARAMID: number;
  SPID: number;
  PARAMTYPE: string;
  PARAMDESC: string;
  PARAMVALUE: string;
  ADDLPARAMVALUE1: string | null;
  ADDLPARAMVALUE2: string | null;
  ADDLPARAMVALUE3: string | null;
  ADDLPARAMVALUE4: string | null;
  ADDLPARAMVALUE5: string | null;
  SORTSEQ: number;
  INACTIVECODEFLAG: 'Y' | 'N' | null;
  INACTIVEDATE: string | null;
  CREATEDBY: string;
  DATECREATED: string;
  LASTUPDATEDBY: string | null;
  LASTUPDATEDDATE: string | null;
  ERRORMESG: string | null;
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