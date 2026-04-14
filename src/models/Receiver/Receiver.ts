import { LinkedInStatus } from "@/models/Emission/Emission";

export interface ReceiverMedal {
    name: string;
    issuer: string;
    date: string;
    category: string;
    linkedInStatus: LinkedInStatus;
}

export interface Receiver {
    id: string;
    name: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    medals: ReceiverMedal[];
}
