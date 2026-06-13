import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
    MODALIDADE_OPTIONS,
    TIPO_OPTIONS,
    type EventoModalidade,
    type EventoTipo,
} from "@/models/Event/EventCreatePayload";
import {
    parseCompetencias,
    toBase64ImageSrc,
    type EventDetail,
} from "@/models/Event/EventDetailResponse";
import type { ParticipanteEvento, TipoParticipante } from "@/models/Client/Client";
import { CompetenciasChipsField } from "./CompetenciasChipsField";
import { ParticipantsEditor } from "./ParticipantsEditor";
import { SignaturePreview } from "./SignaturePreview";

export interface EventDraft {
    titulo: string;
    dataInicial: string;
    dataFinal: string;
    horaInicial: string;
    horaFinal: string;
    cargaHoraria: number;
    pontos: number;
    tipo: EventoTipo;
    assuntoEvento: string;
    descricao: string;
    competencias: string[];
    modalidade: EventoModalidade;
    endereco: string;
    capacidade: number | "";
    nomeSignatario: string;
    cargoSignatario: string;
    participantes: ParticipanteEvento[];
}

export function buildDraft(detail: EventDetail): EventDraft {
    return {
        titulo: detail.titulo,
        dataInicial: detail.dataInicial,
        dataFinal: detail.dataFinal ?? "",
        horaInicial: toTimeInput(detail.horaInicial),
        horaFinal: toTimeInput(detail.horaFinal),
        cargaHoraria: detail.cargaHoraria,
        pontos: detail.pontos,
        tipo: detail.tipo,
        assuntoEvento: detail.assuntoEvento,
        descricao: detail.descricao ?? "",
        competencias: parseCompetencias(detail.competencias),
        modalidade: detail.modalidade,
        endereco: detail.endereco ?? "",
        capacidade: detail.capacidade ?? "",
        nomeSignatario: detail.nomeSignatario,
        cargoSignatario: detail.cargoSignatario,
        participantes: Array.from(
            new Map(
                (detail.participantes ?? []).map((p) => [
                    `${p.clientId}:${p.tipoParticipante}`,
                    { clientId: p.clientId, tipoParticipante: p.tipoParticipante },
                ]),
            ).values(),
        ),
    };
}

const TIPO_PARTICIPANTE_LABEL: Record<TipoParticipante, string> = {
    ORGANIZADOR: "Organizadores",
    PALESTRANTE: "Palestrantes",
    PATROCINADOR: "Patrocinadores",
};

const TIPO_PARTICIPANTE_LIST: TipoParticipante[] = [
    "ORGANIZADOR",
    "PALESTRANTE",
    "PATROCINADOR",
];

const formatDate = (d: string | null | undefined) =>
    d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : null;

const toTimeInput = (value: string | null | undefined) =>
    value ? value.slice(0, 5) : "";

const formatTime = (value: string | null | undefined) =>
    value ? value.slice(0, 5) : null;

const tipoLabel = (value: EventoTipo) =>
    TIPO_OPTIONS.find(o => o.value === value)?.label ?? value;

const modalidadeLabel = (value: EventoModalidade) =>
    MODALIDADE_OPTIONS.find(o => o.value === value)?.label ?? value;

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <Separator />
            </div>
            {children}
        </section>
    );
}

function ViewField({ label, value }: { label: string; value: React.ReactNode }) {
    const isEmpty =
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="text-sm text-foreground">{isEmpty ? "-" : value}</div>
        </div>
    );
}

function DateField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (next: string) => void;
}) {
    const date = value ? new Date(`${value}T00:00:00`) : undefined;
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn("w-full justify-start font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={d => {
                            if (!d) {
                                onChange("");
                                return;
                            }
                            const yyyy = d.getFullYear();
                            const mm = String(d.getMonth() + 1).padStart(2, "0");
                            const dd = String(d.getDate()).padStart(2, "0");
                            onChange(`${yyyy}-${mm}-${dd}`);
                        }}
                        locale={ptBR}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

function TimeField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (next: string) => void;
}) {
    return (
        <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <Input
                type="time"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    );
}

interface InformacoesTabProps {
    detail: EventDetail;
    mode: "view" | "edit";
    draft: EventDraft;
    onDraftChange: (next: EventDraft) => void;
    signatureFile: File | null;
    onSignatureFileChange: (file: File | null) => void;
}

export function InformacoesTab({
    detail,
    mode,
    draft,
    onDraftChange,
    signatureFile,
    onSignatureFileChange,
}: InformacoesTabProps) {
    const isEdit = mode === "edit";
    const competenciasView = parseCompetencias(detail.competencias);
    const signatureSrc = toBase64ImageSrc(detail.assinaturaSignatario);

    const update = <K extends keyof EventDraft>(key: K, value: EventDraft[K]) => {
        onDraftChange({ ...draft, [key]: value });
    };

    return (
        <Card className="p-6 space-y-8">
            <Section title="Divulgação">
                <div className="grid grid-cols-2 gap-4">
                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                            <Select
                                value={draft.tipo}
                                onValueChange={value => update("tipo", value as EventoTipo)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIPO_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <ViewField label="Tipo" value={tipoLabel(detail.tipo)} />
                    )}
                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Assunto do Evento</Label>
                            <Input
                                value={draft.assuntoEvento}
                                onChange={e => update("assuntoEvento", e.target.value)}
                            />
                        </div>
                    ) : (
                        <ViewField label="Assunto do Evento" value={detail.assuntoEvento} />
                    )}
                </div>

                {isEdit ? (
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Competências</Label>
                        <CompetenciasChipsField
                            value={draft.competencias}
                            onChange={value => update("competencias", value)}
                        />
                    </div>
                ) : (
                    <ViewField
                        label="Competências"
                        value={
                            competenciasView.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {competenciasView.map(c => (
                                        <Badge key={c} variant="secondary" className="text-xs">
                                            {c}
                                        </Badge>
                                    ))}
                                </div>
                            ) : null
                        }
                    />
                )}

                {isEdit ? (
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Descrição</Label>
                        <Textarea
                            value={draft.descricao}
                            onChange={e => update("descricao", e.target.value)}
                            rows={3}
                        />
                    </div>
                ) : (
                    <ViewField
                        label="Descrição"
                        value={
                            detail.descricao ? (
                                <p className="text-sm text-foreground whitespace-pre-line">
                                    {detail.descricao}
                                </p>
                            ) : null
                        }
                    />
                )}
            </Section>

            <Section title="Informações Básicas">
                <div className="grid grid-cols-2 gap-4">
                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Título</Label>
                            <Input
                                value={draft.titulo}
                                maxLength={50}
                                onChange={e => update("titulo", e.target.value)}
                            />
                        </div>
                    ) : (
                        <ViewField label="Título" value={detail.titulo} />
                    )}

                    {isEdit ? null : (
                        <div /> /* spacer */
                    )}

                    {isEdit ? (
                        <DateField
                            label="Data Inicial"
                            value={draft.dataInicial}
                            onChange={value => update("dataInicial", value)}
                        />
                    ) : (
                        <ViewField label="Data Inicial" value={formatDate(detail.dataInicial)} />
                    )}

                    {isEdit ? (
                        <DateField
                            label="Data Final"
                            value={draft.dataFinal}
                            onChange={value => update("dataFinal", value)}
                        />
                    ) : (
                        <ViewField label="Data Final" value={formatDate(detail.dataFinal)} />
                    )}

                    {isEdit ? (
                        <TimeField
                            label="Hora Inicial"
                            value={draft.horaInicial}
                            onChange={value => update("horaInicial", value)}
                        />
                    ) : (
                        <ViewField label="Hora Inicial" value={formatTime(detail.horaInicial)} />
                    )}

                    {isEdit ? (
                        <TimeField
                            label="Hora Final"
                            value={draft.horaFinal}
                            onChange={value => update("horaFinal", value)}
                        />
                    ) : (
                        <ViewField label="Hora Final" value={formatTime(detail.horaFinal)} />
                    )}

                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Carga Horária</Label>
                            <Input
                                type="number"
                                min={1}
                                max={99}
                                value={draft.cargaHoraria}
                                onChange={e => update("cargaHoraria", Number(e.target.value) || 0)}
                            />
                        </div>
                    ) : (
                        <ViewField
                            label="Carga Horária"
                            value={`${detail.cargaHoraria} horas`}
                        />
                    )}

                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Pontos</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={draft.pontos}
                                onChange={e => update("pontos", Number(e.target.value) || 0)}
                            />
                        </div>
                    ) : (
                        <ViewField label="Pontos" value={detail.pontos} />
                    )}
                </div>
            </Section>

            <Section title="Local">
                <div className="grid grid-cols-2 gap-4">
                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Modalidade</Label>
                            <Select
                                value={draft.modalidade}
                                onValueChange={value =>
                                    update("modalidade", value as EventoModalidade)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODALIDADE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <ViewField
                            label="Modalidade"
                            value={modalidadeLabel(detail.modalidade)}
                        />
                    )}

                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Capacidade</Label>
                            <Input
                                type="number"
                                min={1}
                                value={draft.capacidade === "" ? "" : draft.capacidade}
                                onChange={e => {
                                    const raw = e.target.value;
                                    update("capacidade", raw === "" ? "" : Number(raw));
                                }}
                            />
                        </div>
                    ) : (
                        <ViewField label="Capacidade" value={detail.capacidade} />
                    )}

                    {isEdit ? (
                        <div className="space-y-1 col-span-2">
                            <Label className="text-xs text-muted-foreground">Endereço</Label>
                            <Input
                                value={draft.endereco}
                                onChange={e => update("endereco", e.target.value)}
                            />
                        </div>
                    ) : (
                        <div className="col-span-2">
                            <ViewField label="Endereço" value={detail.endereco} />
                        </div>
                    )}
                </div>
            </Section>

            <Section title="Organização">
                {isEdit ? (
                    <ParticipantsEditor
                        value={draft.participantes}
                        onChange={(next) => update("participantes", next)}
                        knownNames={Object.fromEntries(
                            (detail.participantes ?? []).map((p) => [p.clientId, p.nome]),
                        )}
                    />
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {TIPO_PARTICIPANTE_LIST.map((tipo) => {
                            const items = (detail.participantes ?? []).filter(
                                (p) => p.tipoParticipante === tipo,
                            );
                            return (
                                <ViewField
                                    key={tipo}
                                    label={TIPO_PARTICIPANTE_LABEL[tipo]}
                                    value={
                                        items.length > 0 ? (
                                            <div className="flex flex-col gap-1 pt-1">
                                                {items.map((p) => (
                                                    <span
                                                        key={p.id}
                                                        className="text-sm text-foreground"
                                                        title={p.email}
                                                    >
                                                        {p.nome}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null
                                    }
                                />
                            );
                        })}
                    </div>
                )}
            </Section>

            <Section title="Assinatura">
                <SignaturePreview
                    currentSrc={signatureSrc}
                    mode={mode}
                    file={signatureFile}
                    onFileChange={onSignatureFileChange}
                />
                <div className="grid grid-cols-2 gap-4">
                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                                Nome do Signatário
                            </Label>
                            <Input
                                value={draft.nomeSignatario}
                                onChange={e => update("nomeSignatario", e.target.value)}
                            />
                        </div>
                    ) : (
                        <ViewField label="Nome do Signatário" value={detail.nomeSignatario} />
                    )}

                    {isEdit ? (
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">
                                Cargo do Signatário
                            </Label>
                            <Input
                                value={draft.cargoSignatario}
                                onChange={e => update("cargoSignatario", e.target.value)}
                            />
                        </div>
                    ) : (
                        <ViewField label="Cargo do Signatário" value={detail.cargoSignatario} />
                    )}
                </div>
            </Section>
        </Card>
    );
}
