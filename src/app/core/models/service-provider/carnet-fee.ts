export interface CarnetFee {
    feeCommissionId: number;
    feeType: string;
    commissionRate: number;
    effectiveDate: Date;
    spid: number;
    dateCreated?: Date | null;
    createdBy?: string | null;
}
