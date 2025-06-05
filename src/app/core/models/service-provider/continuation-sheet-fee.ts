export interface ContinuationSheetFee {
    id: number;
    spid: number;
    rate: number;
    effectiveDate: Date;
    customerType: string;
    carnetType: string;
    dateCreated?: Date | null;
    createdBy?: string | null;
}
