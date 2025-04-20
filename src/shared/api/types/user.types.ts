
export interface User 
{
    businessDetails: {
        clientName: string;
        companyType: string;
        taxId: string;
        employeeSize: string;
        ownerPhone: string;
        ownerEmail: string;
        companyName: string;
    };
    address: {
        street1: string;
        street2: string;
        zipCode: string;
        city: string;
        state: string;
        country: string;
    };
    _id: string;
    name: string;
    phone: string;  
    userType: string;
    username: string;
    email: string;
    password: string;
    role: string;
    timeZone: string;
    preferredContactMethod: string;
    notes: string[];
    paymentStatus: string;
    allowLogin: boolean;
    activeAccount: boolean;
    bannedAccount: boolean;
    accountManagers: string[];
    isFirstTimeLogin: boolean;
    isfirstPasswordResetDone: boolean;
    agreementAccepted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;    
}

export interface UserResponse {
    data: User[];
    status: number;
    statusText: string;
}

export interface UserActivity {
    userId: string;
    activityType: string;
    description: string;
    ip?: string;
    browserInfo?: string;
}