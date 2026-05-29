import { z } from "zod";
import { isValidCpf, unmaskCpf } from "@/lib/cpf";

export const registrationSchema = z.object({
    nome: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(2, "Informe seu nome completo")),
    email: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().email("Informe um e-mail válido")),
    cpf: z
        .string()
        .transform(unmaskCpf)
        .refine((v) => v.length === 11, "CPF inválido")
        .refine(isValidCpf, "CPF inválido"),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
