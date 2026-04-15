import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    Plus, X, Check, ArrowLeft, ArrowRight, CheckCircle2,
    Search, SlidersHorizontal, ArrowUpDown, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { EventItem, Organizer } from "@/models/Event/Event";
import type { Teacher } from "@/models/Teacher/Teacher";
import type { Medal } from "@/models/Medal/Medal";
import type { Course } from "@/models/Course/Course";
import studentData from "@/mock/Student.json";
import teacherData from "@/mock/Teacher.json";
import medalData from "@/mock/Medal.json";
import courseData from "@/mock/Course/Course.json";
import { useEvents } from "@/pages/EventsPage/EventsContext";

interface Student {
    id: string;
    name: string;
    ra: string;
    email: string;
    curso: string;
}

const allTeachers: Teacher[] = teacherData.mockTeachers as Teacher[];
const allStudents: Student[] = studentData.mockStudents as Student[];
const allCourses: Course[] = courseData.mockCourses as Course[];
const initialMedals: Medal[] = medalData.mockMedals as Medal[];

const STEPS = ["Informações", "Data e Horário", "Organizadores", "Medalhas", "Revisão"];

const emptyForm = {
    title: "", modality: "", description: "",
    startDate: "", endDate: "", multiDay: false, startTime: "", endTime: "",
    organizers: [] as Organizer[],
    medalIds: [] as string[],
};

const chipColor = (type: string) => {
    if (type === "professor") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "aluno") return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
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
                medalIds: [...(editingEvent.medalIds ?? [])],
            }
            : { ...emptyForm }
    );

    // --- Organizers dialog state ---
    const [orgDialogOpen, setOrgDialogOpen] = useState(false);
    const [orgTab, setOrgTab] = useState("professor");
    const [orgSearch, setOrgSearch] = useState("");
    const [orgCourseFilter, setOrgCourseFilter] = useState<string[]>([]);
    const [orgSort, setOrgSort] = useState<"asc" | "desc">("asc");
    const [orgFilterOpen, setOrgFilterOpen] = useState(false);
    const [orgSortOpen, setOrgSortOpen] = useState(false);
    const [selTeacherIds, setSelTeacherIds] = useState<string[]>([]);
    const [selStudentIds, setSelStudentIds] = useState<string[]>([]);
    const [dialogOthers, setDialogOthers] = useState<string[]>([]);
    const [orgOtherInput, setOrgOtherInput] = useState("");

    // --- Medals step state ---
    const [medals, setMedals] = useState<Medal[]>(initialMedals);
    const [medalSearch, setMedalSearch] = useState("");
    const [medalCatFilter, setMedalCatFilter] = useState("all");
    const [medalFilterOpen, setMedalFilterOpen] = useState(false);
    const [showNewMedal, setShowNewMedal] = useState(false);
    const [newMedal, setNewMedal] = useState({ name: "", category: "", description: "" });

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
            organizers: form.organizers,
            medalIds: form.medalIds,
            status: "agendado",
        };
        editingEvent ? updateEvent(saved) : addEvent(saved);
        setShowSuccess(true);
        toast({ title: editingEvent ? "Evento atualizado" : "Evento criado com sucesso" });
    };

    // --- Org dialog helpers ---
    function openOrgDialog() {
        setSelTeacherIds(
            allTeachers.filter(t => form.organizers.some(o => o.name === t.name && o.type === "professor")).map(t => t.id)
        );
        setSelStudentIds(
            allStudents.filter(s => form.organizers.some(o => o.name === s.name && o.type === "aluno")).map(s => s.id)
        );
        setDialogOthers(form.organizers.filter(o => o.type === "outro").map(o => o.name));
        setOrgSearch(""); setOrgCourseFilter([]); setOrgSort("asc");
        setOrgTab("professor"); setOrgFilterOpen(false); setOrgSortOpen(false); setOrgOtherInput("");
        setOrgDialogOpen(true);
    }

    function confirmOrgDialog() {
        const teachers = allTeachers.filter(t => selTeacherIds.includes(t.id))
            .map(t => ({ name: t.name, type: "professor" as const }));
        const students = allStudents.filter(s => selStudentIds.includes(s.id))
            .map(s => ({ name: s.name, type: "aluno" as const }));
        const others = dialogOthers.map(name => ({ name, type: "outro" as const }));
        setForm(prev => ({ ...prev, organizers: [...teachers, ...students, ...others] }));
        setOrgDialogOpen(false);
    }

    function switchOrgTab(tab: string) {
        setOrgTab(tab);
        setOrgSearch(""); setOrgCourseFilter([]); setOrgSort("asc");
        setOrgFilterOpen(false); setOrgSortOpen(false);
    }

    function toggleCourseFilter(courseId: string) {
        setOrgCourseFilter(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
    }

    function toggleTeacher(id: string) {
        setSelTeacherIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }

    function toggleStudent(id: string) {
        setSelStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }

    function addOtherOrg() {
        const name = orgOtherInput.trim();
        if (!name || dialogOthers.includes(name)) return;
        setDialogOthers(prev => [...prev, name]);
        setOrgOtherInput("");
    }

    const filteredTeachers = useMemo(() => {
        let list = allTeachers.filter(t => t.active);
        if (orgCourseFilter.length > 0)
            list = list.filter(t => t.courseIds.some(cid => orgCourseFilter.includes(cid)));
        if (orgSearch)
            list = list.filter(t => t.name.toLowerCase().includes(orgSearch.toLowerCase()));
        return [...list].sort((a, b) =>
            orgSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [orgCourseFilter, orgSearch, orgSort]);

    const filteredStudents = useMemo(() => {
        let list = [...allStudents];
        if (orgCourseFilter.length > 0) {
            const abbrevs = allCourses.filter(c => orgCourseFilter.includes(c.id)).map(c => c.abbreviation);
            list = list.filter(s => abbrevs.includes(s.curso));
        }
        if (orgSearch)
            list = list.filter(s => s.name.toLowerCase().includes(orgSearch.toLowerCase()));
        return [...list].sort((a, b) =>
            orgSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [orgCourseFilter, orgSearch, orgSort]);

    // --- Medal helpers ---
    const medalCategories = useMemo(() => [...new Set(medals.map(m => m.category))], [medals]);

    const filteredMedals = useMemo(() => {
        let list = medals.filter(m => m.active);
        if (medalCatFilter !== "all") list = list.filter(m => m.category === medalCatFilter);
        if (medalSearch) list = list.filter(m => m.name.toLowerCase().includes(medalSearch.toLowerCase()));
        return list;
    }, [medals, medalCatFilter, medalSearch]);

    function toggleMedal(medalId: string) {
        setForm(prev => ({
            ...prev,
            medalIds: prev.medalIds.includes(medalId)
                ? prev.medalIds.filter(id => id !== medalId)
                : [...prev.medalIds, medalId],
        }));
    }

    function addNewMedal() {
        if (!newMedal.name.trim() || !newMedal.category.trim()) return;
        const created: Medal = {
            id: crypto.randomUUID(),
            name: newMedal.name.trim(),
            category: newMedal.category.trim(),
            description: newMedal.description.trim(),
            keywords: [],
            active: true,
        };
        setMedals(prev => [...prev, created]);
        setForm(prev => ({ ...prev, medalIds: [...prev.medalIds, created.id] }));
        setNewMedal({ name: "", category: "", description: "" });
        setShowNewMedal(false);
        toast({ title: "Medalha criada", description: `${created.name} foi criada e selecionada.` });
    }

    // --- Filter/Sort Popover shared between professor and aluno tabs ---
    const FilterSortControls = () => (
        <>
            <Popover open={orgFilterOpen} onOpenChange={setOrgFilterOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className={cn(orgCourseFilter.length > 0 && "border-primary text-primary")}>
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Filtrar por curso</p>
                    {allCourses.map(course => (
                        <div key={course.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                            onClick={() => toggleCourseFilter(course.id)}>
                            <Checkbox checked={orgCourseFilter.includes(course.id)} onCheckedChange={() => toggleCourseFilter(course.id)} />
                            <span className="text-sm flex-1">{course.name}</span>
                            <Badge variant="outline" className="text-[10px]">{course.abbreviation}</Badge>
                        </div>
                    ))}
                </PopoverContent>
            </Popover>
            <Popover open={orgSortOpen} onOpenChange={setOrgSortOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <ArrowUpDown className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Ordenar</p>
                    <button
                        className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", orgSort === "asc" && "font-medium bg-muted")}
                        onClick={() => { setOrgSort("asc"); setOrgSortOpen(false); }}>
                        {orgSort === "asc" && <Check className="w-3 h-3" />}
                        <span className={orgSort !== "asc" ? "pl-5" : ""}>A → Z</span>
                    </button>
                    <button
                        className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", orgSort === "desc" && "font-medium bg-muted")}
                        onClick={() => { setOrgSort("desc"); setOrgSortOpen(false); }}>
                        {orgSort === "desc" && <Check className="w-3 h-3" />}
                        <span className={orgSort !== "desc" ? "pl-5" : ""}>Z → A</span>
                    </button>
                </PopoverContent>
            </Popover>
        </>
    );

    // --- Success screen ---
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
                            {form.modality} · {form.organizers.length} organizador(es) · {form.medalIds.length} medalha(s)
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
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                        <h1 className="text-xl font-semibold text-foreground">
                            {editingEvent ? "Editar evento" : "Novo evento"}
                        </h1>
                    </div>

                    {/* Steps indicator */}
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

                    {/* Step content */}
                    <div className="bg-card border border-border rounded-xl p-6 mb-6">

                        {/* Step 0: Informações */}
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

                        {/* Step 1: Data e Horário */}
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

                        {/* Step 2: Organizadores */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Organizadores do evento</h3>
                                    <Button size="sm" onClick={openOrgDialog}>
                                        <Users className="w-4 h-4 mr-1.5" /> Adicionar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[48px]">
                                    {form.organizers.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Nenhum organizador adicionado.</p>
                                    )}
                                    {form.organizers.map((o, i) => (
                                        <span key={i} className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", chipColor(o.type))}>
                                            {o.name}
                                            <button onClick={() => setForm(f => ({ ...f, organizers: f.organizers.filter((_, j) => j !== i) }))} className="hover:opacity-70">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Medalhas */}
                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Selecione as medalhas</h3>
                                    <Button size="sm" variant="outline" onClick={() => setShowNewMedal(v => !v)}>
                                        <Plus className="w-4 h-4 mr-1" /> Nova medalha
                                    </Button>
                                </div>

                                {/* New medal inline form */}
                                {showNewMedal && (
                                    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nova medalha</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Nome</Label>
                                                <Input className="mt-1" placeholder="Nome da medalha" value={newMedal.name}
                                                    onChange={e => setNewMedal(v => ({ ...v, name: e.target.value }))} />
                                            </div>
                                            <div>
                                                <Label>Categoria</Label>
                                                <Input className="mt-1" placeholder="Ex: Tecnologia" value={newMedal.category}
                                                    onChange={e => setNewMedal(v => ({ ...v, category: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Descrição</Label>
                                            <Input className="mt-1" placeholder="Breve descrição" value={newMedal.description}
                                                onChange={e => setNewMedal(v => ({ ...v, description: e.target.value }))} />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button size="sm" variant="outline" onClick={() => { setShowNewMedal(false); setNewMedal({ name: "", category: "", description: "" }); }}>
                                                Cancelar
                                            </Button>
                                            <Button size="sm" onClick={addNewMedal} disabled={!newMedal.name.trim() || !newMedal.category.trim()}>
                                                <Plus className="w-3 h-3 mr-1" /> Criar e selecionar
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Search + category filter */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Buscar medalha..." value={medalSearch}
                                            onChange={e => setMedalSearch(e.target.value)} className="pl-9" />
                                    </div>
                                    <Popover open={medalFilterOpen} onOpenChange={setMedalFilterOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon" className={cn(medalCatFilter !== "all" && "border-primary text-primary")}>
                                                <SlidersHorizontal className="w-4 h-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-48 p-2">
                                            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Categoria</p>
                                            <button
                                                className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted", medalCatFilter === "all" && "bg-muted font-medium")}
                                                onClick={() => { setMedalCatFilter("all"); setMedalFilterOpen(false); }}>
                                                Todas
                                            </button>
                                            {medalCategories.map(cat => (
                                                <button key={cat}
                                                    className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted", medalCatFilter === cat && "bg-muted font-medium")}
                                                    onClick={() => { setMedalCatFilter(cat); setMedalFilterOpen(false); }}>
                                                    {cat}
                                                </button>
                                            ))}
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Medal grid */}
                                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                    {filteredMedals.map(medal => {
                                        const selected = form.medalIds.includes(medal.id);
                                        return (
                                            <button
                                                key={medal.id}
                                                onClick={() => toggleMedal(medal.id)}
                                                className={cn(
                                                    "text-left p-3 rounded-lg border transition-all",
                                                    selected
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="text-sm font-medium text-foreground leading-tight">{medal.name}</span>
                                                    {selected && <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] mt-1.5">{medal.category}</Badge>
                                            </button>
                                        );
                                    })}
                                    {filteredMedals.length === 0 && (
                                        <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                                            Nenhuma medalha encontrada.
                                        </div>
                                    )}
                                </div>
                                {form.medalIds.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{form.medalIds.length} medalha(s) selecionada(s)</p>
                                )}
                            </div>
                        )}

                        {/* Step 4: Revisão */}
                        {step === 4 && (
                            <div className="space-y-5">
                                <h3 className="text-sm font-medium text-foreground">Revisão do evento</h3>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Modalidade:</span>{" "}
                                        <span className="font-medium text-foreground">{form.modality}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Título:</span>{" "}
                                        <span className="font-medium text-foreground">{form.title}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-muted-foreground">Descrição:</span>{" "}
                                        <span className="text-foreground">{form.description || "—"}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Data:</span>{" "}
                                        <span className="font-medium text-foreground">
                                            {formatDate(form.startDate)}{form.multiDay && form.endDate ? ` a ${formatDate(form.endDate)}` : ""}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Horário:</span>{" "}
                                        <span className="font-medium text-foreground">{form.startTime || "—"} — {form.endTime || "—"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground mb-1.5">Organizadores:</p>
                                        {form.organizers.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {form.organizers.map((o, i) => (
                                                    <span key={i} className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", chipColor(o.type))}>
                                                        {o.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className="text-foreground text-sm">—</span>}
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground mb-1.5">Medalhas:</p>
                                        {form.medalIds.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {form.medalIds.map(mid => {
                                                    const medal = medals.find(m => m.id === mid);
                                                    if (!medal) return null;
                                                    return (
                                                        <span key={mid} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200">
                                                            {medal.name}
                                                            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">{medal.category}</Badge>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : <span className="text-foreground text-sm">—</span>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        {step > 0 ? (
                            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                            </Button>
                        ) : <div />}
                        {step < STEPS.length - 1 ? (
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

            {/* Organizers Dialog */}
            <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                <DialogContent className="sm:max-w-2xl flex flex-col max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Adicionar organizadores</DialogTitle>
                    </DialogHeader>

                    <Tabs value={orgTab} onValueChange={switchOrgTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full">
                            <TabsTrigger value="professor" className="flex-1">Professores</TabsTrigger>
                            <TabsTrigger value="aluno" className="flex-1">Alunos</TabsTrigger>
                            <TabsTrigger value="outro" className="flex-1">Outros</TabsTrigger>
                        </TabsList>

                        {/* Professors */}
                        <TabsContent value="professor" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Buscar professor..." value={orgSearch}
                                        onChange={e => setOrgSearch(e.target.value)} className="pl-9" />
                                </div>
                                <FilterSortControls />
                            </div>
                            <div className="overflow-y-auto space-y-0.5 max-h-64">
                                {filteredTeachers.map(teacher => (
                                    <div key={teacher.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
                                        onClick={() => toggleTeacher(teacher.id)}>
                                        <Checkbox checked={selTeacherIds.includes(teacher.id)} onCheckedChange={() => toggleTeacher(teacher.id)} />
                                        <span className="text-sm font-medium flex-1">{teacher.name}</span>
                                        <div className="flex gap-1">
                                            {allCourses.filter(c => teacher.courseIds.includes(c.id)).map(c => (
                                                <Badge key={c.id} variant="secondary" className="text-[10px]">{c.abbreviation}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {filteredTeachers.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum professor encontrado.</p>
                                )}
                            </div>
                            {selTeacherIds.length > 0 && (
                                <p className="text-xs text-muted-foreground">{selTeacherIds.length} selecionado(s)</p>
                            )}
                        </TabsContent>

                        {/* Students */}
                        <TabsContent value="aluno" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Buscar aluno..." value={orgSearch}
                                        onChange={e => setOrgSearch(e.target.value)} className="pl-9" />
                                </div>
                                <FilterSortControls />
                            </div>
                            <div className="overflow-y-auto space-y-0.5 max-h-64">
                                {filteredStudents.map(student => (
                                    <div key={student.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
                                        onClick={() => toggleStudent(student.id)}>
                                        <Checkbox checked={selStudentIds.includes(student.id)} onCheckedChange={() => toggleStudent(student.id)} />
                                        <span className="text-sm font-medium flex-1">{student.name}</span>
                                        <Badge variant="secondary" className="text-[10px]">{student.curso}</Badge>
                                    </div>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum aluno encontrado.</p>
                                )}
                            </div>
                            {selStudentIds.length > 0 && (
                                <p className="text-xs text-muted-foreground">{selStudentIds.length} selecionado(s)</p>
                            )}
                        </TabsContent>

                        {/* Others */}
                        <TabsContent value="outro" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <Input placeholder="Nome do organizador externo"
                                    value={orgOtherInput}
                                    onChange={e => setOrgOtherInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") addOtherOrg(); }} />
                                <Button variant="outline" onClick={addOtherOrg} disabled={!orgOtherInput.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto space-y-1 max-h-64">
                                {dialogOthers.map((name, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
                                        <span className="text-sm flex-1">{name}</span>
                                        <button onClick={() => setDialogOthers(prev => prev.filter((_, j) => j !== i))}
                                            className="text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {dialogOthers.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum organizador externo adicionado.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-4 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setOrgDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmOrgDialog}>Confirmar seleção</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
