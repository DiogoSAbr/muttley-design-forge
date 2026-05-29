import { apiFetch } from "@/lib/api/client";
import type { RegistrationPayload } from "@/models/Event/RegistrationPayload";
import type { PresencePayload } from "@/models/Event/PresencePayload";

export const PublicEventService = {
    registerParticipant(eventId: string, payload: RegistrationPayload): Promise<unknown> {
        return apiFetch(`events/${eventId}/inscricoes`, {
            method: "POST",
            body: payload,
        });
    },

    confirmPresence(eventId: string, payload: PresencePayload): Promise<unknown> {
        return apiFetch(`events/${eventId}/confirmacoes`, {
            method: "POST",
            body: payload,
        });
    },
};
