export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "professor" | "admin";
}
