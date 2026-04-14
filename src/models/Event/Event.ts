export interface Organizer {
    name: string;
    type: "professor" | "aluno" | "outro";
}

export interface Participant {
    name: string;
    type: "professor" | "aluno" | "outro";
}

export interface Competency {
    name: string;
    target: "todos" | "participantes" | "organizadores";
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
    participants: Participant[];
    competencies: Competency[];
    status: "agendado" | "cancelado" | "concluido";
}
