export interface Contact {
    spContactId: number;
    serviceProviderId: number;
    defaultContact: boolean;
    firstName: string;
    lastName: string;
    middleInitial: string;
    title: string;
    phone: string;
    mobile: string;
    fax: string;
    email: string;
    dateCreated?: Date | null;
    createdBy?: string | null;
    lastUpdatedBy?: string | null;
    lastUpdatedDate?: Date | null;
    isInactive?: boolean | null;
    inactivatedDate?: Date | null;
}
