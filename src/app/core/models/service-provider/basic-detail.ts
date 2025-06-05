export interface BasicDetail {
    cargoSurety: string;
    cargoPolicyNo: string;
    bondSurety: string;
    spid: number;
    companyName: string;
    lookupCode?: string;
    address1: string;
    address2?: string;
    city: string;
    country: string;
    state: string;
    zip: string;
    issuingRegion: string;
    replacementRegion: string;
}
