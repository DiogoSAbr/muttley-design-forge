import { apiFetch } from "@/lib/api/client";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const AuthService = {
    login(data: LoginRequest): Promise<LoginResponse> {
        return apiFetch<LoginResponse>("auth/login", {
            method: "POST",
            body: data,
        });
    },
};
