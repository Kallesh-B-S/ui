export interface SecurityDeposit {
    securityDepositId: number;
    holderType: string;
    uscibMember: boolean;
    specialCommodity: string;
    specialCountry: string;
    rate: number;
    effectiveDate: Date;
    spid: number;
    dateCreated?: Date | null;
    createdBy?: string | null;
}
