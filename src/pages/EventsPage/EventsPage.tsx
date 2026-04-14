import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import {
    Plus, Pencil, Trash2, Search, X, Check, ArrowLeft, ArrowRight, CheckCircle2, Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { EventItem, Organizer, Participant, Competency } from "@/models/Event/Event";
import studentData from "@/mock/Student.json";
import teacherData from "@/mock/Teacher.json";
import eventData from "@/mock/Event.json";

const mockTeachers = teacherData.mockTeachers.map((t) => t.name);
const mockStudents = studentData.mockStudents.map((s) => s.name);
const mockCompetencies: string[] = eventData.mockCompetencies;
const initialEvents: EventItem[] = eventData.mockEvents as EventItem[];

const STEPS = ["Informações", "Data e Horário", "Organizadores", "Participantes", "Competências", "Revisão"];

const emptyForm = {
    title: "", modality: "", description: "",
    startDate: "", endDate: "", multiDay: false, startTime: "", endTime: "",
    organizers: [] as Organizer[],
    participants: [] as Participant[],
    competencies: [] as Competency[],
};

export default function EventsPage() {
    const { toast } = useToast();
    const [events, setEvents] = useState<EventItem[]>(initialEvents);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [cancelId, setCancelId] = useState<string | null>(null);

    const [showStepper, setShowStepper] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({ ...emptyForm });
    const [showSuccess, setShowSuccess] = useState(false);

    const [orgType, setOrgType] = useState<string>("");
    const [orgName, setOrgName] = useState("");
    const [partType, setPartType] = useState<string>("");
    const [partName, setPartName] = useState("");

    const [compName, setCompName] = useState("");
    const [compTarget, setCompTarget] = useState<string>("todos");
    const [newCompName, setNewCompName] = useState("");

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.modality.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        setStep(0);
        setShowSuccess(false);
        setShowStepper(true);
    };

    const openEdit = (ev: EventItem) => {
        setEditingId(ev.id);
        setForm({
            title: ev.title, modality: ev.modality, description: ev.description,
            startDate: ev.startDate, endDate: ev.endDate, multiDay: !!ev.endDate,
            startTime: ev.startTime, endTime: ev.endTime,
            organizers: [...ev.organizers], participants: [...ev.participants],
            competencies: [...ev.competencies],
        });
        setStep(0);
        setShowSuccess(false);
        setShowStepper(true);
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setEvents(prev => prev.filter(e => e.id !== deleteId));
        setDeleteId(null);
        toast({ title: "Evento excluído" });
    };

    const handleCancel = () => {
        if (!cancelId) return;
        setEvents(prev => prev.map(e => e.id === cancelId ? { ...e, status: "cancelado" as const } : e));
        setCancelId(null);
        toast({ title: "Evento cancelado" });
    };

    const canAdvance = () => {
        if (step === 0) return !!form.modality && !!form.title.trim();
        if (step === 1) return !!form.startDate;
        return true;
    };

    const handleFinish = () => {
        const newEvent: EventItem = {
            id: editingId || Date.now().toString(),
            title: form.title, modality: form.modality, description: form.description,
            startDate: form.startDate, endDate: form.multiDay ? form.endDate : "",
            startTime: form.startTime, endTime: form.endTime,
            organizers: form.organizers, participants: form.participants,
            competencies: form.competencies, status: "agendado",
        };
        if (editingId) {
            setEvents(prev => prev.map(e => e.id === editingId ? newEvent : e));
        } else {
            setEvents(prev => [newEvent, ...prev]);
        }
        setShowSuccess(true);
        toast({ title: editingId ? "Evento atualizado" : "Evento criado com sucesso" });
    };

    const addPerson = (list: "organizers" | "participants") => {
        const type = list === "organizers" ? orgType : partType;
        const name = list === "organizers" ? orgName : partName;
        if (!type || !name.trim()) return;
        const person = { name: name.trim(), type: type as Organizer["type"] };
        setForm(prev => ({ ...prev, [list]: [...prev[list], person] }));
        if (list === "organizers") { setOrgType(""); setOrgName(""); }
        else { setPartType(""); setPartName(""); }
    };

    const removePerson = (list: "organizers" | "participants", idx: number) => {
        setForm(prev => ({ ...prev, [list]: prev[list].filter((_, i) => i !== idx) }));
    };

    const addCompetency = () => {
        if (!compName.trim()) return;
        setForm(prev => ({
            ...prev,
            competencies: [...prev.competencies, { name: compName.trim(), target: compTarget as Competency["target"] }],
        }));
        setCompName("");
        setCompTarget("todos");
    };

    const addNewCompetency = () => {
        if (!newCompName.trim()) return;
        setForm(prev => ({
            ...prev,
            competencies: [...prev.competencies, { name: newCompName.trim(), target: compTarget as Competency["target"] }],
        }));
        setNewCompName("");
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

    const statusMap: Record<string, { label: string; variant: "success" | "error" | "warning" }> = {
        agendado: { label: "Agendado", variant: "warning" },
        cancelado: { label: "Cancelado", variant: "error" },
        concluido: { label: "Concluído", variant: "success" },
    };

    if (showStepper) {
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
                                Evento {editingId ? "atualizado" : "criado"} com sucesso!
                            </h2>
                            <p className="text-muted-foreground mb-1 font-medium">{form.title}</p>
                            <p className="text-sm text-muted-foreground mb-8">
                                {form.modality} · {form.organizers.length} organizador(es) · {form.participants.length} participante(s) · {form.competencies.length} competência(s)
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => { setShowStepper(false); setShowSuccess(false); }}>
                                    Voltar à listagem
                                </Button>
                                <Button onClick={() => { setForm({ ...emptyForm }); setEditingId(null); setStep(0); setShowSuccess(false); }}>
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
                            <Button variant="ghost" size="sm" onClick={() => setShowStepper(false)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                            <h1 className="text-xl font-semibold text-foreground">
                                {editingId ? "Editar evento" : "Novo evento"}
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
                                                <SelectContent>
                                                    {mockTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        ) : orgType === "aluno" ? (
                                            <Select value={orgName} onValueChange={setOrgName}>
                                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                <SelectContent>
                                                    {mockStudents.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
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
                                                <SelectContent>
                                                    {mockTeachers.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        ) : partType === "aluno" ? (
                                            <Select value={partName} onValueChange={setPartName}>
                                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                                <SelectContent>
                                                    {mockStudents.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
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
                                    <Check className="w-4 h-4 mr-1" /> {editingId ? "Salvar alterações" : "Criar evento"}
                                </Button>
                            )}
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
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Gerenciar eventos</h1>
                            <p className="text-sm text-muted-foreground">{events.length} eventos cadastrados</p>
                        </div>
                        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Novo evento</Button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar por título ou modalidade..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40">
                                    <th className="text-left p-3 font-medium text-muted-foreground">Título</th>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Modalidade</th>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                                    <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                                    <th className="text-right p-3 font-medium text-muted-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(ev => (
                                    <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                        <td className="p-3 font-medium text-foreground">{ev.title}</td>
                                        <td className="p-3 text-muted-foreground">{ev.modality}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {formatDate(ev.startDate)}{ev.endDate ? ` — ${formatDate(ev.endDate)}` : ""}
                                        </td>
                                        <td className="p-3">
                                            <StatusBadge variant={statusMap[ev.status].variant}>{statusMap[ev.status].label}</StatusBadge>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(ev)} title="Editar">
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                {ev.status === "agendado" && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600 hover:text-orange-700" onClick={() => setCancelId(ev.id)} title="Cancelar">
                                                        <Ban className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(ev.id)} title="Excluir">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhum evento encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar evento?</AlertDialogTitle>
                        <AlertDialogDescription>O evento será marcado como cancelado. Esta ação pode ser revertida editando o evento.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} className="bg-orange-600 hover:bg-orange-700">Cancelar evento</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir evento?</AlertDialogTitle>
                        <AlertDialogDescription>Esta ação é irreversível. O evento será permanentemente removido.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
