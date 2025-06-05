export interface CounterfoilFee {
    id: number,
    spid: number,
    startSets: number,
    endSets: number,
    customerType: string,
    carnetType: string,
    effectiveDate: Date,
    rate: number,
    dateCreated?: Date | null;
    createdBy?: string | null;
}
