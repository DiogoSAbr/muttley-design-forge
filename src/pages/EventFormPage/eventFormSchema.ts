import { z } from "zod";

export const TIPO_VALUES = [
    "ACADEMICO",
    "CIENTIFICO",
    "CORPORATIVO",
    "CURSO",
    "ENTRETENIMENTO",
    "ESPORTIVO",
    "EXIBICAO",
    "NETWORKING",
] as const;

export const MODALIDADE_VALUES = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;

export const TIPO_PARTICIPANTE_VALUES = ["ORGANIZADOR", "PALESTRANTE", "PATROCINADOR"] as const;

const participanteSchema = z.object({
    clientId: z.string().min(1),
    tipoParticipante: z.enum(TIPO_PARTICIPANTE_VALUES),
});

export const eventFormSchema = z
    .object({
        titulo: z
            .string()
            .min(1, "Título é obrigatório")
            .max(20, "Máximo 20 caracteres"),
        dataInicial: z.string().min(1, "Data inicial é obrigatória"),
        dataFinal: z.string().optional().or(z.literal("")),
        horaInicial: z.string().min(1, "Hora inicial é obrigatória"),
        horaFinal: z.string().min(1, "Hora final é obrigatória"),
        cargaHoraria: z
            .number({ invalid_type_error: "Informe a carga horária" })
            .int("Use número inteiro")
            .min(1, "Mínimo 1 hora")
            .max(99, "Máximo 99 horas"),
        pontos: z
            .number({ invalid_type_error: "Informe os pontos" })
            .int("Use número inteiro")
            .min(1, "Mínimo 1")
            .max(100, "Máximo 100"),

        tipo: z.enum(TIPO_VALUES, {
            errorMap: () => ({ message: "Selecione um tipo" }),
        }),
        assuntoEvento: z
            .string()
            .min(1, "Assunto é obrigatório")
            .max(50, "Máximo 50 caracteres"),
        competencias: z
            .array(z.string().min(1).max(15))
            .max(10, "Máximo 10 competências"),
        descricao: z
            .string()
            .max(255, "Máximo 255 caracteres")
            .optional()
            .or(z.literal("")),

        modalidade: z.enum(MODALIDADE_VALUES, {
            errorMap: () => ({ message: "Selecione a modalidade" }),
        }),
        endereco: z.string().optional().or(z.literal("")),
        capacidade: z
            .number()
            .int("Use número inteiro")
            .positive("Maior que zero")
            .optional()
            .or(z.nan().transform(() => undefined)),

        participantesEquipe: z
            .array(participanteSchema)
            .refine(
                (arr) => arr.some((p) => p.tipoParticipante === "ORGANIZADOR"),
                { message: "Adicione pelo menos 1 organizador" }
            ),

        nomeSignatario: z
            .string()
            .min(1, "Nome do signatário é obrigatório")
            .max(30, "Máximo 30 caracteres"),
        cargoSignatario: z
            .string()
            .min(1, "Cargo do signatário é obrigatório")
            .max(30, "Máximo 30 caracteres"),
        arquivoAssinaturaSignatario: z
            .instanceof(File, { message: "Envie o arquivo de assinatura" }),
    })
    .superRefine((data, ctx) => {
        if (data.modalidade !== "REMOTO") {
            if (!data.endereco || data.endereco.trim() === "") {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["endereco"],
                    message: "Endereço obrigatório para eventos presenciais/híbridos",
                });
            }
        }
        if (data.dataFinal && data.dataFinal !== "") {
            if (data.dataFinal < data.dataInicial) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dataFinal"],
                    message: "Data final deve ser posterior à data inicial",
                });
            }
        }
        const mesmoDia =
            !data.dataFinal ||
            data.dataFinal === "" ||
            data.dataFinal === data.dataInicial;
        if (mesmoDia && data.horaInicial && data.horaFinal) {
            if (data.horaFinal <= data.horaInicial) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["horaFinal"],
                    message: "Hora final deve ser posterior à inicial",
                });
            }
        }
    });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const STEP_FIELDS: (keyof EventFormValues)[][] = [
    ["titulo", "dataInicial", "dataFinal", "horaInicial", "horaFinal", "cargaHoraria", "pontos"],
    ["tipo", "assuntoEvento", "competencias", "descricao"],
    ["modalidade", "endereco", "capacidade"],
    ["participantesEquipe"],
    ["nomeSignatario", "cargoSignatario", "arquivoAssinaturaSignatario"],
];

export const STEP_LABELS = [
    "Informações",
    "Divulgação",
    "Local",
    "Organização",
    "Assinatura",
];

export const emptyFormValues: Partial<EventFormValues> = {
    titulo: "",
    dataInicial: "",
    dataFinal: "",
    horaInicial: "",
    horaFinal: "",
    cargaHoraria: undefined,
    pontos: undefined,
    tipo: undefined,
    assuntoEvento: "",
    competencias: [],
    descricao: "",
    modalidade: undefined,
    endereco: "",
    capacidade: undefined,
    participantesEquipe: [],
    nomeSignatario: "",
    cargoSignatario: "",
    arquivoAssinaturaSignatario: undefined,
};
