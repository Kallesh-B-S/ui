export interface ExpeditedFee {
    expeditedFeeId: number;
    customerType: string;
    deliveryType: string;
    startTime: number;
    endTime: number;
    timeZone: string;
    fee: number;
    effectiveDate: Date;
    dateCreated?: Date | null;
    createdBy?: string | null;
}
