import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicLayout } from "../_shared/public/PublicLayout";
import { PublicErrorState } from "../_shared/public/PublicErrorState";
import { PublicSuccessState } from "../_shared/public/PublicSuccessState";
import { PresenceForm } from "./components/PresenceForm";

export default function PresencePage() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId")?.trim() ?? "";
    const [success, setSuccess] = useState(false);

    if (!eventId) {
        return (
            <PublicLayout title="Formulário de Presença">
                <PublicErrorState />
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title="Formulário de Presença">
            {success ? (
                <PublicSuccessState
                    title="Presença confirmada com sucesso"
                    description="Sua participação no evento foi registrada."
                />
            ) : (
                <PresenceForm eventId={eventId} onSuccess={() => setSuccess(true)} />
            )}
        </PublicLayout>
    );
}
