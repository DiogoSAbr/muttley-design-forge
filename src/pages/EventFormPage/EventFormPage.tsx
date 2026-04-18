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
    Search, SlidersHorizontal, ArrowUpDown, Users, MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { EventItem, Organizer, MedalAudience } from "@/models/Event/Event";
import type { Teacher } from "@/models/Teacher/Teacher";
import type { Medal } from "@/models/Medal/Medal";
import type { Course } from "@/models/Course/Course";
import studentData from "@/mock/Student.json";
import teacherData from "@/mock/Teacher.json";
import medalData from "@/mock/Medal.json";
import courseData from "@/mock/Course.json";
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

const MEDAL_CATEGORIES = ["Tecnologia", "Liderança", "Comunicação", "Gestão", "Acadêmico"];

const STEPS = ["Informações", "Data e Horário", "Palestrantes", "Organizadores", "Medalhas", "Revisão"];

const AUDIENCE_OPTIONS: { value: MedalAudience; label: string }[] = [
    { value: "palestrante", label: "Palestrante" },
    { value: "organizador", label: "Organizador" },
    { value: "ouvintes", label: "Ouvintes" },
];

const ALL_AUDIENCES: MedalAudience[] = ["palestrante", "organizador", "ouvintes"];

const emptyForm = {
    title: "", modality: "", description: "", location: "",
    startDate: "", endDate: "", multiDay: false, startTime: "", endTime: "",
    speakers: [] as Organizer[],
    organizers: [] as Organizer[],
    medalIds: [] as string[],
    medalAudiences: {} as Record<string, MedalAudience[]>,
};

const chipColor = (type: string) => {
    if (type === "professor") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "aluno") return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
};

const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

const needsLocation = (modality: string) => modality === "Presencial" || modality === "Híbrido";

const audienceLabel: Record<MedalAudience, string> = {
    palestrante: "Palestrante",
    organizador: "Organizador",
    ouvintes: "Ouvintes",
};

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
                location: editingEvent.location ?? "",
                startDate: editingEvent.startDate,
                endDate: editingEvent.endDate,
                multiDay: !!editingEvent.endDate,
                startTime: editingEvent.startTime,
                endTime: editingEvent.endTime,
                speakers: [...(editingEvent.speakers ?? [])],
                organizers: [...editingEvent.organizers],
                medalIds: [...(editingEvent.medalIds ?? [])],
                medalAudiences: { ...(editingEvent.medalAudiences ?? {}) } as Record<string, MedalAudience[]>,
            }
            : { ...emptyForm }
    );

    const [personDialogOpen, setPersonDialogOpen] = useState(false);
    const [personDialogMode, setPersonDialogMode] = useState<"speaker" | "organizer">("organizer");
    const [personTab, setPersonTab] = useState("professor");
    const [personSearch, setPersonSearch] = useState("");
    const [personCourseFilter, setPersonCourseFilter] = useState<string[]>([]);
    const [personSort, setPersonSort] = useState<"asc" | "desc">("asc");
    const [personFilterOpen, setPersonFilterOpen] = useState(false);
    const [personSortOpen, setPersonSortOpen] = useState(false);
    const [selPersonTeacherIds, setSelPersonTeacherIds] = useState<string[]>([]);
    const [selPersonStudentIds, setSelPersonStudentIds] = useState<string[]>([]);
    const [dialogPersonOthers, setDialogPersonOthers] = useState<string[]>([]);
    const [personOtherInput, setPersonOtherInput] = useState("");

    const [medals, setMedals] = useState<Medal[]>(initialMedals);
    const [medalSearch, setMedalSearch] = useState("");
    const [medalCatFilter, setMedalCatFilter] = useState("all");
    const [medalFilterOpen, setMedalFilterOpen] = useState(false);

    const [newMedalDialogOpen, setNewMedalDialogOpen] = useState(false);
    const [newMedalForm, setNewMedalForm] = useState({ name: "", description: "", category: "", keywords: [] as string[] });
    const [newMedalKeywordInput, setNewMedalKeywordInput] = useState("");

    const canAdvance = () => {
        if (step === 0) return !!form.modality && !!form.title.trim();
        if (step === 1) return !!form.startDate;
        return true;
    };

    const handleFinish = () => {
        const saved: EventItem = {
            id: editingEvent?.id || Date.now().toString(),
            title: form.title,
            modality: form.modality,
            description: form.description,
            location: needsLocation(form.modality) ? form.location : undefined,
            startDate: form.startDate,
            endDate: form.multiDay ? form.endDate : "",
            startTime: form.startTime,
            endTime: form.endTime,
            speakers: form.speakers,
            organizers: form.organizers,
            medalIds: form.medalIds,
            medalAudiences: form.medalAudiences,
            status: "agendado",
        };
        editingEvent ? updateEvent(saved) : addEvent(saved);
        setShowSuccess(true);
        toast({ title: editingEvent ? "Evento atualizado" : "Evento criado com sucesso" });
    };

    function openPersonDialog(mode: "speaker" | "organizer") {
        const currentList = mode === "speaker" ? form.speakers : form.organizers;
        setPersonDialogMode(mode);
        setSelPersonTeacherIds(
            allTeachers.filter(t => currentList.some(o => o.name === t.name && o.type === "professor")).map(t => t.id)
        );
        setSelPersonStudentIds(
            allStudents.filter(s => currentList.some(o => o.name === s.name && o.type === "aluno")).map(s => s.id)
        );
        setDialogPersonOthers(currentList.filter(o => o.type === "outro").map(o => o.name));
        setPersonSearch(""); setPersonCourseFilter([]); setPersonSort("asc");
        setPersonTab("professor"); setPersonFilterOpen(false); setPersonSortOpen(false); setPersonOtherInput("");
        setPersonDialogOpen(true);
    }

    function confirmPersonDialog() {
        const teachers = allTeachers.filter(t => selPersonTeacherIds.includes(t.id))
            .map(t => ({ name: t.name, type: "professor" as const }));
        const students = allStudents.filter(s => selPersonStudentIds.includes(s.id))
            .map(s => ({ name: s.name, type: "aluno" as const }));
        const others = dialogPersonOthers.map(name => ({ name, type: "outro" as const }));
        const combined = [...teachers, ...students, ...others];
        if (personDialogMode === "speaker") {
            setForm(prev => ({ ...prev, speakers: combined }));
        } else {
            setForm(prev => ({ ...prev, organizers: combined }));
        }
        setPersonDialogOpen(false);
    }

    function switchPersonTab(tab: string) {
        setPersonTab(tab);
        setPersonSearch(""); setPersonCourseFilter([]); setPersonSort("asc");
        setPersonFilterOpen(false); setPersonSortOpen(false);
    }

    function togglePersonCourseFilter(courseId: string) {
        setPersonCourseFilter(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
    }

    function togglePersonTeacher(id: string) {
        setSelPersonTeacherIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }

    function togglePersonStudent(id: string) {
        setSelPersonStudentIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }

    function addOtherPerson() {
        const name = personOtherInput.trim();
        if (!name || dialogPersonOthers.includes(name)) return;
        setDialogPersonOthers(prev => [...prev, name]);
        setPersonOtherInput("");
    }

    const filteredPersonTeachers = useMemo(() => {
        let list = allTeachers.filter(t => t.active);
        if (personCourseFilter.length > 0)
            list = list.filter(t => t.courseIds.some(cid => personCourseFilter.includes(cid)));
        if (personSearch)
            list = list.filter(t => t.name.toLowerCase().includes(personSearch.toLowerCase()));
        return [...list].sort((a, b) =>
            personSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [personCourseFilter, personSearch, personSort]);

    const filteredPersonStudents = useMemo(() => {
        let list = [...allStudents];
        if (personCourseFilter.length > 0) {
            const abbrevs = allCourses.filter(c => personCourseFilter.includes(c.id)).map(c => c.abbreviation);
            list = list.filter(s => abbrevs.includes(s.curso));
        }
        if (personSearch)
            list = list.filter(s => s.name.toLowerCase().includes(personSearch.toLowerCase()));
        return [...list].sort((a, b) =>
            personSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [personCourseFilter, personSearch, personSort]);

    const medalCategories = useMemo(() => [...new Set(medals.map(m => m.category))], [medals]);

    const filteredMedals = useMemo(() => {
        let list = medals.filter(m => m.active);
        if (medalCatFilter !== "all") list = list.filter(m => m.category === medalCatFilter);
        if (medalSearch) list = list.filter(m => m.name.toLowerCase().includes(medalSearch.toLowerCase()));
        return list;
    }, [medals, medalCatFilter, medalSearch]);

    function toggleMedal(medalId: string) {
        setForm(prev => {
            if (prev.medalIds.includes(medalId)) {
                const newAudiences = { ...prev.medalAudiences };
                delete newAudiences[medalId];
                return { ...prev, medalIds: prev.medalIds.filter(id => id !== medalId), medalAudiences: newAudiences };
            }
            return {
                ...prev,
                medalIds: [...prev.medalIds, medalId],
                medalAudiences: { ...prev.medalAudiences, [medalId]: [...ALL_AUDIENCES] },
            };
        });
    }

    function toggleMedalAudience(medalId: string, audience: MedalAudience) {
        setForm(prev => {
            const current: MedalAudience[] = prev.medalAudiences[medalId] ?? [...ALL_AUDIENCES];
            const next = current.includes(audience)
                ? current.filter(a => a !== audience)
                : [...current, audience];
            return { ...prev, medalAudiences: { ...prev.medalAudiences, [medalId]: next } };
        });
    }

    function openNewMedalDialog() {
        setNewMedalForm({ name: "", description: "", category: "", keywords: [] });
        setNewMedalKeywordInput("");
        setNewMedalDialogOpen(true);
    }

    function addNewMedalKeyword() {
        const trimmed = newMedalKeywordInput.trim();
        if (trimmed && !newMedalForm.keywords.includes(trimmed)) {
            setNewMedalForm(v => ({ ...v, keywords: [...v.keywords, trimmed] }));
            setNewMedalKeywordInput("");
        }
    }

    function saveNewMedal() {
        if (!newMedalForm.name.trim() || !newMedalForm.category) return;
        const created: Medal = {
            id: crypto.randomUUID(),
            name: newMedalForm.name.trim(),
            category: newMedalForm.category,
            description: newMedalForm.description.trim(),
            keywords: newMedalForm.keywords,
            active: true,
        };
        setMedals(prev => [...prev, created]);
        setForm(prev => ({
            ...prev,
            medalIds: [...prev.medalIds, created.id],
            medalAudiences: { ...prev.medalAudiences, [created.id]: [...ALL_AUDIENCES] },
        }));
        setNewMedalDialogOpen(false);
        toast({ title: "Medalha criada", description: `"${created.name}" foi criada e selecionada.` });
    }

    const PersonFilterSortControls = () => (
        <>
            <Popover open={personFilterOpen} onOpenChange={setPersonFilterOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className={cn(personCourseFilter.length > 0 && "border-primary text-primary")}>
                        <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-52 p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Filtrar por curso</p>
                    {allCourses.map(course => (
                        <div key={course.id}
                            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
                            onClick={() => togglePersonCourseFilter(course.id)}>
                            <Checkbox checked={personCourseFilter.includes(course.id)} onCheckedChange={() => togglePersonCourseFilter(course.id)} />
                            <span className="text-sm flex-1">{course.name}</span>
                            <Badge variant="outline" className="text-[10px]">{course.abbreviation}</Badge>
                        </div>
                    ))}
                </PopoverContent>
            </Popover>
            <Popover open={personSortOpen} onOpenChange={setPersonSortOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                        <ArrowUpDown className="w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-44 p-2">
                    <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Ordenar</p>
                    <button
                        className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", personSort === "asc" && "font-medium bg-muted")}
                        onClick={() => { setPersonSort("asc"); setPersonSortOpen(false); }}>
                        {personSort === "asc" && <Check className="w-3 h-3" />}
                        <span className={personSort !== "asc" ? "pl-5" : ""}>A → Z</span>
                    </button>
                    <button
                        className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", personSort === "desc" && "font-medium bg-muted")}
                        onClick={() => { setPersonSort("desc"); setPersonSortOpen(false); }}>
                        {personSort === "desc" && <Check className="w-3 h-3" />}
                        <span className={personSort !== "desc" ? "pl-5" : ""}>Z → A</span>
                    </button>
                </PopoverContent>
            </Popover>
        </>
    );

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
                            {form.modality} · {form.speakers.length} palestrante(s) · {form.organizers.length} organizador(es) · {form.medalIds.length} medalha(s)
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
                                {needsLocation(form.modality) && (
                                    <div>
                                        <Label className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5" /> Localidade
                                        </Label>
                                        <Input className="mt-1" placeholder="Ex: Bloco A — Sala 203, FATEC Zona Leste"
                                            value={form.location}
                                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
                                    </div>
                                )}
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
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Palestrantes do evento</h3>
                                    <Button size="sm" onClick={() => openPersonDialog("speaker")}>
                                        <Users className="w-4 h-4 mr-1.5" /> Adicionar
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[48px]">
                                    {form.speakers.length === 0 && (
                                        <p className="text-sm text-muted-foreground">Nenhum palestrante adicionado.</p>
                                    )}
                                    {form.speakers.map((s, i) => (
                                        <span key={i} className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", chipColor(s.type))}>
                                            {s.name}
                                            <button onClick={() => setForm(f => ({ ...f, speakers: f.speakers.filter((_, j) => j !== i) }))} className="hover:opacity-70">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Organizadores do evento</h3>
                                    <Button size="sm" onClick={() => openPersonDialog("organizer")}>
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

                        {step === 4 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Selecione as medalhas</h3>
                                    <Button size="sm" variant="outline" onClick={openNewMedalDialog}>
                                        <Plus className="w-4 h-4 mr-1" /> Nova medalha
                                    </Button>
                                </div>

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

                                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                                    {filteredMedals.map(medal => {
                                        const selected = form.medalIds.includes(medal.id);
                                        const audiences: MedalAudience[] = form.medalAudiences[medal.id] ?? [...ALL_AUDIENCES];
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

                                                {selected && (
                                                    <div className="mt-2 pt-2 border-t border-border/60" onClick={e => e.stopPropagation()}>
                                                        <p className="text-[10px] text-muted-foreground mb-1.5">Para quem:</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {AUDIENCE_OPTIONS.map(opt => (
                                                                <button
                                                                    key={opt.value}
                                                                    type="button"
                                                                    onClick={() => toggleMedalAudience(medal.id, opt.value)}
                                                                    className={cn(
                                                                        "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                                                                        audiences.includes(opt.value)
                                                                            ? "bg-primary text-primary-foreground border-primary"
                                                                            : "bg-transparent text-muted-foreground border-muted-foreground/30 hover:border-muted-foreground/60"
                                                                    )}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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

                        {step === 5 && (
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
                                    {needsLocation(form.modality) && form.location && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Localidade:</span>{" "}
                                            <span className="text-foreground">{form.location}</span>
                                        </div>
                                    )}
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
                                        <p className="text-muted-foreground mb-1.5">Palestrantes:</p>
                                        {form.speakers.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {form.speakers.map((s, i) => (
                                                    <span key={i} className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", chipColor(s.type))}>
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : <span className="text-foreground text-sm">—</span>}
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
                                                    const auds: MedalAudience[] = form.medalAudiences[mid] ?? [...ALL_AUDIENCES];
                                                    return (
                                                        <span key={mid} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-800 border-amber-200">
                                                            {medal.name}
                                                            <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">{medal.category}</Badge>
                                                            <span className="text-[10px] text-amber-600">→ {auds.map(a => audienceLabel[a]).join(", ")}</span>
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

            <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
                <DialogContent className="sm:max-w-2xl flex flex-col max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>
                            {personDialogMode === "speaker" ? "Adicionar palestrantes" : "Adicionar organizadores"}
                        </DialogTitle>
                    </DialogHeader>

                    <Tabs value={personTab} onValueChange={switchPersonTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full">
                            <TabsTrigger value="professor" className="flex-1">Professores</TabsTrigger>
                            <TabsTrigger value="aluno" className="flex-1">Alunos</TabsTrigger>
                            <TabsTrigger value="outro" className="flex-1">Outros</TabsTrigger>
                        </TabsList>

                        <TabsContent value="professor" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Buscar professor..." value={personSearch}
                                        onChange={e => setPersonSearch(e.target.value)} className="pl-9" />
                                </div>
                                <PersonFilterSortControls />
                            </div>
                            <div className="overflow-y-auto space-y-0.5 max-h-64">
                                {filteredPersonTeachers.map(teacher => (
                                    <div key={teacher.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
                                        onClick={() => togglePersonTeacher(teacher.id)}>
                                        <Checkbox checked={selPersonTeacherIds.includes(teacher.id)} onCheckedChange={() => togglePersonTeacher(teacher.id)} />
                                        <span className="text-sm font-medium flex-1">{teacher.name}</span>
                                        <div className="flex gap-1">
                                            {allCourses.filter(c => teacher.courseIds.includes(c.id)).map(c => (
                                                <Badge key={c.id} variant="secondary" className="text-[10px]">{c.abbreviation}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {filteredPersonTeachers.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum professor encontrado.</p>
                                )}
                            </div>
                            {selPersonTeacherIds.length > 0 && (
                                <p className="text-xs text-muted-foreground">{selPersonTeacherIds.length} selecionado(s)</p>
                            )}
                        </TabsContent>

                        <TabsContent value="aluno" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="Buscar aluno..." value={personSearch}
                                        onChange={e => setPersonSearch(e.target.value)} className="pl-9" />
                                </div>
                                <PersonFilterSortControls />
                            </div>
                            <div className="overflow-y-auto space-y-0.5 max-h-64">
                                {filteredPersonStudents.map(student => (
                                    <div key={student.id}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted cursor-pointer"
                                        onClick={() => togglePersonStudent(student.id)}>
                                        <Checkbox checked={selPersonStudentIds.includes(student.id)} onCheckedChange={() => togglePersonStudent(student.id)} />
                                        <span className="text-sm font-medium flex-1">{student.name}</span>
                                        <Badge variant="secondary" className="text-[10px]">{student.curso}</Badge>
                                    </div>
                                ))}
                                {filteredPersonStudents.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum aluno encontrado.</p>
                                )}
                            </div>
                            {selPersonStudentIds.length > 0 && (
                                <p className="text-xs text-muted-foreground">{selPersonStudentIds.length} selecionado(s)</p>
                            )}
                        </TabsContent>

                        <TabsContent value="outro" className="flex flex-col gap-3 mt-3 flex-1 min-h-0">
                            <div className="flex gap-2">
                                <Input
                                    placeholder={personDialogMode === "speaker" ? "Nome do palestrante externo" : "Nome do organizador externo"}
                                    value={personOtherInput}
                                    onChange={e => setPersonOtherInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") addOtherPerson(); }} />
                                <Button variant="outline" onClick={addOtherPerson} disabled={!personOtherInput.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="overflow-y-auto space-y-1 max-h-64">
                                {dialogPersonOthers.map((name, i) => (
                                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
                                        <span className="text-sm flex-1">{name}</span>
                                        <button onClick={() => setDialogPersonOthers(prev => prev.filter((_, j) => j !== i))}
                                            className="text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {dialogPersonOthers.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum adicionado.</p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-4 pt-4 border-t border-border">
                        <Button variant="outline" onClick={() => setPersonDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmPersonDialog}>Confirmar seleção</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={newMedalDialogOpen} onOpenChange={setNewMedalDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nova medalha</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nome</Label>
                            <Input className="mt-1" placeholder="Ex: Certificação em React"
                                value={newMedalForm.name}
                                onChange={e => setNewMedalForm(v => ({ ...v, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Textarea className="mt-1" rows={3} placeholder="Descreva a competência..."
                                value={newMedalForm.description}
                                onChange={e => setNewMedalForm(v => ({ ...v, description: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Categoria</Label>
                            <Select value={newMedalForm.category} onValueChange={v => setNewMedalForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
                                <SelectContent>
                                    {MEDAL_CATEGORIES.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Competências</Label>
                            <div className="flex gap-2 mt-1">
                                <Input
                                    placeholder="Adicionar competência..."
                                    value={newMedalKeywordInput}
                                    onChange={e => setNewMedalKeywordInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addNewMedalKeyword(); } }}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addNewMedalKeyword}>
                                    Adicionar
                                </Button>
                            </div>
                            {newMedalForm.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {newMedalForm.keywords.map(k => (
                                        <span key={k}
                                            className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                            onClick={() => setNewMedalForm(v => ({ ...v, keywords: v.keywords.filter(kw => kw !== k) }))}>
                                            {k} ×
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewMedalDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={saveNewMedal} disabled={!newMedalForm.name.trim() || !newMedalForm.category}>
                            Criar e selecionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
