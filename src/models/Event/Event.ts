export interface Organizer {
    name: string;
    type: "professor" | "aluno" | "outro";
}

export interface EventItem {
    id: string;
    title: string;
    modality: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    organizers: Organizer[];
    medalIds: string[];
    status: "agendado" | "cancelado" | "concluido";
}
