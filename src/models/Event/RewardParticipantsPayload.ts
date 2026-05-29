export interface RewardParticipantsPayload {
    eventoId: string;
    participanteIds: string[];
    descricaoMedalha: string;
    competenciasMedalha: string[];
    arquivoPlanoDeFundo: File;
}
