import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, X, Check, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { EventItem, Organizer, Participant, Competency } from "@/models/Event/Event";
import studentData from "@/mock/Student.json";
import teacherData from "@/mock/Teacher.json";
import eventData from "@/mock/Event.json";
import { useEvents } from "@/pages/EventsPage/EventsContext";

const mockTeachers = teacherData.mockTeachers.map((t) => t.name);
const mockStudents = studentData.mockStudents.map((s) => s.name);
const mockCompetencies: string[] = eventData.mockCompetencies;

const STEPS = ["Informações", "Data e Horário", "Organizadores", "Participantes", "Competências", "Revisão"];

const emptyForm = {
    title: "", modality: "", description: "",
    startDate: "", endDate: "", multiDay: false, startTime: "", endTime: "",
    organizers: [] as Organizer[],
    participants: [] as Participant[],
    competencies: [] as Competency[],
};

const chipColor = (type: string) => {
    if (type === "professor") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "aluno") return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
};

const targetLabel = (t: string) => {
    if (t === "participantes") return "Participantes";
    if (t === "organizadores") return "Organizadores";
    return "Todos";
};

const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

export default function EventFormPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { events, addEvent, updateEvent } = useEvents();

    const editingEvent = id ? (events.find(e => e.id === id) ?? null) : null;

    const [step, setStep] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const [form, setForm] = useState(() =>
        editingEvent
            ? {
                title: editingEvent.title,
                modality: editingEvent.modality,
                description: editingEvent.description,
                startDate: editingEvent.startDate,
                endDate: editingEvent.endDate,
                multiDay: !!editingEvent.endDate,
                startTime: editingEvent.startTime,
                endTime: editingEvent.endTime,
                organizers: [...editingEvent.organizers],
                participants: [...editingEvent.participants],
                competencies: [...editingEvent.competencies],
            }
            : { ...emptyForm }
    );

    const [orgType, setOrgType] = useState("");
    const [orgName, setOrgName] = useState("");
    const [partType, setPartType] = useState("");
    const [partName, setPartName] = useState("");
    const [compName, setCompName] = useState("");
    const [compTarget, setCompTarget] = useState("todos");
    const [newCompName, setNewCompName] = useState("");

    const canAdvance = () => {
        if (step === 0) return !!form.modality && !!form.title.trim();
        if (step === 1) return !!form.startDate;
        return true;
    };

    const handleFinish = () => {
        const saved: EventItem = {
            id: editingEvent?.id || Date.now().toString(),
            title: form.title, modality: form.modality, description: form.description,
            startDate: form.startDate, endDate: form.multiDay ? form.endDate : "",
            startTime: form.startTime, endTime: form.endTime,
            organizers: form.organizers, participants: form.participants,
            competencies: form.competencies, status: "agendado",
        };
        editingEvent ? updateEvent(saved) : addEvent(saved);
        setShowSuccess(true);
        toast({ title: editingEvent ? "Evento atualizado" : "Evento criado com sucesso" });
    };

    const addPerson = (list: "organizers" | "participants") => {
        const type = list === "organizers" ? orgType : partType;
        const name = list === "organizers" ? orgName : partName;
        if (!type || !name.trim()) return;
        setForm(prev => ({ ...prev, [list]: [...prev[list], { name: name.trim(), type: type as Organizer["type"] }] }));
        if (list === "organizers") { setOrgType(""); setOrgName(""); }
        else { setPartType(""); setPartName(""); }
    };

    const removePerson = (list: "organizers" | "participants", idx: number) => {
        setForm(prev => ({ ...prev, [list]: prev[list].filter((_, i) => i !== idx) }));
    };

    const addCompetency = () => {
        if (!compName.trim()) return;
        setForm(prev => ({ ...prev, competencies: [...prev.competencies, { name: compName.trim(), target: compTarget as Competency["target"] }] }));
        setCompName("");
        setCompTarget("todos");
    };

    const addNewCompetency = () => {
        if (!newCompName.trim()) return;
        setForm(prev => ({ ...prev, competencies: [...prev.competencies, { name: newCompName.trim(), target: compTarget as Competency["target"] }] }));
        setNewCompName("");
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background">
                <AppSidebar />
                <main className="ml-60 p-8">
                    <div className="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Evento {editingEvent ? "atualizado" : "criado"} com sucesso!
                        </h2>
                        <p className="text-muted-foreground mb-1 font-medium">{form.title}</p>
                        <p className="text-sm text-muted-foreground mb-8">
                            {form.modality} · {form.organizers.length} organizador(es) · {form.participants.length} participante(s) · {form.competencies.length} competência(s)
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={() => navigate("/events")}>
                                Voltar à listagem
                            </Button>
                            <Button onClick={() => { setForm({ ...emptyForm }); setStep(0); setShowSuccess(false); navigate("/events/new", { replace: true }); }}>
                                Criar outro evento
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-2xl mx-auto animate-fade-in">
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                        <h1 className="text-xl font-semibold text-foreground">
                            {editingEvent ? "Editar evento" : "Novo evento"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-1 mb-8">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex-1 flex flex-col items-center gap-1.5">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                                    i < step ? "bg-primary text-primary-foreground"
                                        : i === step ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                                            : "bg-muted text-muted-foreground"
                                )}>
                                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={cn("text-[10px] leading-tight text-center", i <= step ? "text-foreground font-medium" : "text-muted-foreground")}>
                                    {s}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 mb-6">
                        {step === 0 && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Modalidade *</Label>
                                    <Select value={form.modality} onValueChange={v => setForm(f => ({ ...f, modality: v }))}>
                                        <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione a modalidade" /></SelectTrigger>
                                        <SelectContent>
                                            {["Presencial", "Online", "Híbrido", "Assíncrono"].map(m => (
                                                <SelectItem key={m} value={m}>{m}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Título *</Label>
                                    <Input className="mt-1" placeholder="Ex: Semana de Tecnologia 2025" value={form.title}
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div>
                                    <Label>Descrição</Label>
                                    <Textarea className="mt-1" rows={4} placeholder="Descrição do evento, objetivos, programação..."
                                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Data de início *</Label>
                                    <Input type="date" className="mt-1" value={form.startDate}
                                        onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch checked={form.multiDay} onCheckedChange={v => setForm(f => ({ ...f, multiDay: v, endDate: v ? f.endDate : "" }))} />
                                    <Label>Evento com múltiplos dias</Label>
                                </div>
                                {form.multiDay && (
                                    <div>
                                        <Label>Data de término</Label>
                                        <Input type="date" className="mt-1" value={form.endDate}
                                            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Horário de início</Label>
                                        <Input type="time" className="mt-1" value={form.startTime}
                                            onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label>Horário de término</Label>
                                        <Input type="time" className="mt-1" value={form.endTime}
                                            onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-foreground">Adicionar organizadores</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Select value={orgType} onValueChange={v => { setOrgType(v); setOrgName(""); }}>
                                        <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professor">Professor</SelectItem>
                                            <SelectItem value="aluno">Aluno</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {orgType === "professor" ? (
                                        <Select value={orgName} onValueChange={setOrgName}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{mockTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : orgType === "aluno" ? (
                                        <Select value={orgName} onValueChange={setOrgName}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{mockStudents.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <Input placeholder="Nome do organizador" value={orgName} onChange={e => setOrgName(e.target.value)} />
                                    )}
                                    <Button onClick={() => addPerson("organizers")} disabled={!orgType || !orgName.trim()}>
                                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.organizers.map((o, i) => (
                                        <span key={i} className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", chipColor(o.type))}>
                                            {o.name}
                                            <button onClick={() => removePerson("organizers", i)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    {form.organizers.length === 0 && <p className="text-sm text-muted-foreground">Nenhum organizador adicionado.</p>}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-foreground">Adicionar participantes</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Select value={partType} onValueChange={v => { setPartType(v); setPartName(""); }}>
                                        <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="professor">Professor</SelectItem>
                                            <SelectItem value="aluno">Aluno</SelectItem>
                                            <SelectItem value="outro">Outro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {partType === "professor" ? (
                                        <Select value={partName} onValueChange={setPartName}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{mockTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : partType === "aluno" ? (
                                        <Select value={partName} onValueChange={setPartName}>
                                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                            <SelectContent>{mockStudents.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    ) : (
                                        <Input placeholder="Nome do participante" value={partName} onChange={e => setPartName(e.target.value)} />
                                    )}
                                    <Button onClick={() => addPerson("participants")} disabled={!partType || !partName.trim()}>
                                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.participants.map((p, i) => (
                                        <span key={i} className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", chipColor(p.type))}>
                                            {p.name}
                                            <button onClick={() => removePerson("participants", i)} className="hover:opacity-70"><X className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    {form.participants.length === 0 && <p className="text-sm text-muted-foreground">Nenhum participante adicionado.</p>}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-5">
                                <h3 className="text-sm font-medium text-foreground">Competências do evento</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <Select value={compName} onValueChange={setCompName}>
                                        <SelectTrigger><SelectValue placeholder="Competência" /></SelectTrigger>
                                        <SelectContent>
                                            {mockCompetencies.filter(c => !form.competencies.some(fc => fc.name === c)).map(c => (
                                                <SelectItem key={c} value={c}>{c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={compTarget} onValueChange={setCompTarget}>
                                        <SelectTrigger><SelectValue placeholder="Direcionamento" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="participantes">Participantes</SelectItem>
                                            <SelectItem value="organizadores">Organizadores</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={addCompetency} disabled={!compName.trim()}>
                                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                                    </Button>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Ou cadastre uma nova competência:</Label>
                                    <div className="grid grid-cols-3 gap-3 mt-1.5">
                                        <Input placeholder="Nome da competência" value={newCompName} onChange={e => setNewCompName(e.target.value)} />
                                        <Select value={compTarget} onValueChange={setCompTarget}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos</SelectItem>
                                                <SelectItem value="participantes">Participantes</SelectItem>
                                                <SelectItem value="organizadores">Organizadores</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button variant="outline" onClick={addNewCompetency} disabled={!newCompName.trim()}>
                                            <Plus className="w-4 h-4 mr-1" /> Cadastrar
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.competencies.map((c, i) => (
                                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200">
                                            {c.name} <span className="text-[10px] opacity-70">({targetLabel(c.target)})</span>
                                            <button onClick={() => setForm(f => ({ ...f, competencies: f.competencies.filter((_, j) => j !== i) }))} className="hover:opacity-70">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {form.competencies.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma competência adicionada.</p>}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-foreground mb-3">Revisão do evento</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                    <div><span className="text-muted-foreground">Modalidade:</span> <span className="font-medium text-foreground">{form.modality}</span></div>
                                    <div><span className="text-muted-foreground">Título:</span> <span className="font-medium text-foreground">{form.title}</span></div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Descrição:</span> <span className="text-foreground">{form.description || "—"}</span></div>
                                    <div><span className="text-muted-foreground">Data:</span> <span className="font-medium text-foreground">{formatDate(form.startDate)}{form.multiDay && form.endDate ? ` a ${formatDate(form.endDate)}` : ""}</span></div>
                                    <div><span className="text-muted-foreground">Horário:</span> <span className="font-medium text-foreground">{form.startTime || "—"} — {form.endTime || "—"}</span></div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Organizadores:</span> <span className="text-foreground">{form.organizers.map(o => o.name).join(", ") || "—"}</span></div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Participantes:</span> <span className="text-foreground">{form.participants.map(p => p.name).join(", ") || "—"}</span></div>
                                    <div className="col-span-2"><span className="text-muted-foreground">Competências:</span> <span className="text-foreground">{form.competencies.map(c => `${c.name} (${targetLabel(c.target)})`).join(", ") || "—"}</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        {step > 0 ? (
                            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                        ) : <div />}
                        {step < 5 ? (
                            <Button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}>
                                Próximo <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button onClick={handleFinish}>
                                <Check className="w-4 h-4 mr-1" /> {editingEvent ? "Salvar alterações" : "Criar evento"}
                            </Button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
