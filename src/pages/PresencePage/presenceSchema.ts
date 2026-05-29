import { z } from "zod";
import { isValidCpf, unmaskCpf } from "@/lib/cpf";

export const presenceSchema = z.object({
    cpf: z
        .string()
        .transform(unmaskCpf)
        .refine((v) => v.length === 11, "CPF inválido")
        .refine(isValidCpf, "CPF inválido"),
});

export type PresenceFormValues = z.infer<typeof presenceSchema>;
