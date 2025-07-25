
export interface ParamProperties {
    paramId?: number;
    spid?: number;
    paramType: string;
    paramDesc: string;
    paramValue: string;
    addlParamValue1: string | null;
    addlParamValue2: string | null;
    addlParamValue3: string | null;
    addlParamValue4: string | null;
    addlParamValue5: string | null;
    sortSeq?: number;
    inactiveCodeFlag: 'Y' | 'N' | null;
    inactiveDate: string | null;
    createdBy: string;
    dateCreated: string;
    lastUpdatedBy: string | null;
    lastUpdatedDate: string | null;
    errorMesg: string | null;
    userId?: string;
}
