import { apiFetch } from "@/lib/api/client";
import type { EventCreatePayload } from "@/models/Event/EventCreatePayload";
import type {
    EventListItem,
    EventSortOption,
    SpringPage,
} from "@/models/Event/EventListResponse";
import type { EventDetail } from "@/models/Event/EventDetailResponse";
import type { EventUpdatePayload } from "@/models/Event/EventUpdatePayload";
import type {
    EventParticipantsResponse,
    ParticipantSortOption,
} from "@/models/Event/EventParticipants";
import type { RewardParticipantsPayload } from "@/models/Event/RewardParticipantsPayload";

export interface CreateEventInput extends EventCreatePayload {
    arquivoAssinaturaSignatario: File;
}

export interface ListEventsParams {
    titulo?: string;
    page: number;
    size: number;
    sort: EventSortOption;
}

export interface ListParticipantsParams {
    page: number;
    size: number;
    sort: ParticipantSortOption;
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
        form.append("dataFinal", input.dataFinal ?? "");
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

        input.participantes.forEach((participante, index) => {
            form.append(`participantesEquipe[${index}].clientId`, participante.clientId);
            form.append(`participantesEquipe[${index}].tipoParticipante`, participante.tipoParticipante);
        });

        form.append("arquivoAssinaturaSignatario", input.arquivoAssinaturaSignatario);

        return apiFetch("events", {
            method: "POST",
            body: form,
        });
    },

    list(params: ListEventsParams, signal?: AbortSignal): Promise<SpringPage<EventListItem>> {
        return apiFetch<SpringPage<EventListItem>>("events", {
            method: "GET",
            params: {
                titulo: params.titulo?.trim() ? params.titulo.trim() : undefined,
                page: params.page,
                size: params.size,
                sort: params.sort,
            },
            signal,
        });
    },

    getById(id: string, signal?: AbortSignal): Promise<EventDetail> {
        return apiFetch<EventDetail>(`events/${id}`, { method: "GET", signal });
    },

    update(id: string, input: EventUpdatePayload): Promise<unknown> {
        const form = new FormData();
        appendIfDefined(form, "titulo", input.titulo);
        appendIfDefined(form, "dataInicial", input.dataInicial);
        form.append("dataFinal", input.dataFinal ?? "");
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

        input.participantes.forEach((participante, index) => {
            form.append(`participantesEquipe[${index}].clientId`, participante.clientId);
            form.append(`participantesEquipe[${index}].tipoParticipante`, participante.tipoParticipante);
        });

        if (input.arquivoAssinaturaSignatario) {
            form.append("arquivoAssinaturaSignatario", input.arquivoAssinaturaSignatario);
        }

        return apiFetch(`events/${id}`, {
            method: "PUT",
            body: form,
        });
    },

    remove(id: string): Promise<unknown> {
        return apiFetch(`events/${id}`, { method: "DELETE" });
    },

    finalize(id: string): Promise<unknown> {
        return apiFetch(`events/${id}/finalizar`, { method: "PATCH" });
    },

    listParticipants(
        id: string,
        params: ListParticipantsParams,
        signal?: AbortSignal,
    ): Promise<EventParticipantsResponse> {
        return apiFetch<EventParticipantsResponse>(`events/${id}/participantes`, {
            method: "GET",
            params: {
                page: params.page,
                size: params.size,
                sort: params.sort,
            },
            signal,
        });
    },

    rewardParticipants(input: RewardParticipantsPayload): Promise<unknown> {
        const form = new FormData();
        form.append("eventoId", input.eventoId);
        input.participanteIds.forEach(pid => form.append("participanteIds", pid));
        form.append("descricaoMedalha", input.descricaoMedalha);
        form.append("competenciasMedalha", JSON.stringify(input.competenciasMedalha));
        form.append("arquivoPlanoDeFundo", input.arquivoPlanoDeFundo);

        return apiFetch("events/participantes/medalha", {
            method: "POST",
            body: form,
        });
    },
};
