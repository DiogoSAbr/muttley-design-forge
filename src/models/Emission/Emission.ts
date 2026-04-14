export type LinkedInStatus = "published" | "pending" | "error";

export interface Emission {
    id: string;
    medalName: string;
    receiverName: string;
    issuerName: string;
    date: string;
    category: string;
    linkedInStatus: LinkedInStatus;
}
