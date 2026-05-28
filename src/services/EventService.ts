import { apiFetch } from "@/lib/api/client";
import type { EventCreatePayload } from "@/models/Event/EventCreatePayload";

export interface CreateEventInput extends EventCreatePayload {
    arquivoAssinaturaSignatario: File;
}

function appendIfDefined(form: FormData, key: string, value: unknown) {
    if (value === undefined || value === null || value === "") return;
    form.append(key, String(value));
}

export const EventService = {
    create(input: CreateEventInput): Promise<unknown> {
        const form = new FormData();
        appendIfDefined(form, "titulo", input.titulo);
        appendIfDefined(form, "dataInicial", input.dataInicial);
        appendIfDefined(form, "dataFinal", input.dataFinal);
        appendIfDefined(form, "cargaHoraria", input.cargaHoraria);
        appendIfDefined(form, "pontos", input.pontos);
        appendIfDefined(form, "tipo", input.tipo);
        appendIfDefined(form, "assuntoEvento", input.assuntoEvento);
        appendIfDefined(form, "descricao", input.descricao);
        appendIfDefined(form, "modalidade", input.modalidade);
        appendIfDefined(form, "endereco", input.endereco);
        appendIfDefined(form, "capacidade", input.capacidade);
        appendIfDefined(form, "nomeSignatario", input.nomeSignatario);
        appendIfDefined(form, "cargoSignatario", input.cargoSignatario);

        form.append("competencias", JSON.stringify(input.competencias));
        form.append("participantes", JSON.stringify(input.participantes));

        form.append("arquivoAssinaturaSignatario", input.arquivoAssinaturaSignatario);

        return apiFetch("events", {
            method: "POST",
            body: form,
        });
    },
};
