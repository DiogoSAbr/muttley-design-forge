import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PublicLayout } from "../_shared/public/PublicLayout";
import { PublicErrorState } from "../_shared/public/PublicErrorState";
import { PublicSuccessState } from "../_shared/public/PublicSuccessState";
import { RegistrationForm } from "./components/RegistrationForm";

export default function RegistrationPage() {
    const [searchParams] = useSearchParams();
    const eventId = searchParams.get("eventId")?.trim() ?? "";
    const [success, setSuccess] = useState(false);

    if (!eventId) {
        return (
            <PublicLayout title="Formulário de Inscrição">
                <PublicErrorState />
            </PublicLayout>
        );
    }

    return (
        <PublicLayout title="Formulário de Inscrição">
            {success ? (
                <PublicSuccessState
                    title="Inscrição realizada com sucesso"
                    description="Você receberá mais informações sobre o evento em breve."
                />
            ) : (
                <RegistrationForm eventId={eventId} onSuccess={() => setSuccess(true)} />
            )}
        </PublicLayout>
    );
}
