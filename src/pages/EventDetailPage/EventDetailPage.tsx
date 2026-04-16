import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
    ArrowLeft, Search, ArrowUpDown, Check, Calendar, Clock,
    SlidersHorizontal, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Medal } from "@/models/Medal/Medal";
import medalData from "@/mock/Medal.json";
import attendanceData from "@/mock/Attendance.json";
import { useEvents } from "@/pages/EventsPage/EventsContext";

interface AttendanceRecord {
    id: string;
    name: string;
    email: string;
    cpf: string;
    linkedin: string;
}

const allMedals: Medal[] = medalData.mockMedals as Medal[];
const allAttendances = attendanceData.attendances as Record<string, AttendanceRecord[]>;

const statusConfig: Record<string, { label: string; className: string }> = {
    agendado: { label: "Agendado", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    cancelado: { label: "Cancelado", className: "bg-red-100 text-red-800 border-red-200" },
    concluido: { label: "Concluído", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

const chipColor = (type: string) => {
    if (type === "professor") return "bg-blue-100 text-blue-800 border-blue-200";
    if (type === "aluno") return "bg-green-100 text-green-800 border-green-200";
    return "bg-purple-100 text-purple-800 border-purple-200";
};

const typeLabel = (type: string) => {
    if (type === "professor") return "Professor";
    if (type === "aluno") return "Aluno";
    return "Outro";
};

const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "";

export default function EventDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { events } = useEvents();

    const event = id ? events.find(e => e.id === id) : null;

    const [orgSearch, setOrgSearch] = useState("");
    const [orgSort, setOrgSort] = useState<"asc" | "desc">("asc");
    const [orgSortOpen, setOrgSortOpen] = useState(false);

    const [medalCatFilter, setMedalCatFilter] = useState("all");
    const [medalFilterOpen, setMedalFilterOpen] = useState(false);

    const [attendSort, setAttendSort] = useState<"asc" | "desc">("asc");
    const [attendSortOpen, setAttendSortOpen] = useState(false);

    const eventMedals = useMemo(() => {
        if (!event) return [];
        return allMedals.filter(m => event.medalIds.includes(m.id));
    }, [event]);

    const medalCategories = useMemo(() => [...new Set(eventMedals.map(m => m.category))], [eventMedals]);

    const filteredMedals = useMemo(() => {
        if (medalCatFilter === "all") return eventMedals;
        return eventMedals.filter(m => m.category === medalCatFilter);
    }, [eventMedals, medalCatFilter]);

    const filteredOrganizers = useMemo(() => {
        if (!event) return [];
        let list = [...event.organizers];
        if (orgSearch) list = list.filter(o => o.name.toLowerCase().includes(orgSearch.toLowerCase()));
        return list.sort((a, b) =>
            orgSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    }, [event, orgSearch, orgSort]);

    const attendanceList = useMemo(() => {
        if (!id) return [];
        return allAttendances[id] ?? [];
    }, [id]);

    const sortedAttendance = useMemo(() =>
        [...attendanceList].sort((a, b) =>
            attendSort === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        ), [attendanceList, attendSort]);

    if (!event) {
        return (
            <div className="min-h-screen bg-background">
                <AppSidebar />
                <main className="ml-60 p-8 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">Evento não encontrado.</p>
                        <Button variant="outline" onClick={() => navigate("/events")}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const status = statusConfig[event.status];
    const qrUrl = `${window.location.origin}/events/${id}/attendance`;

    const showAttendance = event.status !== "cancelado";
    const isScheduled = event.status === "agendado";
    const isConcluded = event.status === "concluido";

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-3xl mx-auto animate-fade-in space-y-6">

                    {/* Page header */}
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/events")}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                        </Button>
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", status.className)}>
                            {status.label}
                        </span>
                    </div>

                    {/* Card 1 — Event info */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="shrink-0 mt-0.5">{event.modality}</Badge>
                            <h1 className="text-xl font-semibold text-foreground leading-tight">{event.title}</h1>
                        </div>

                        {event.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                        )}

                        <div className="flex flex-wrap gap-4 pt-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4 shrink-0" />
                                <span>
                                    {formatDate(event.startDate)}
                                    {event.endDate ? ` a ${formatDate(event.endDate)}` : ""}
                                </span>
                            </div>
                            {(event.startTime || event.endTime) && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4 shrink-0" />
                                    <span>{event.startTime || "—"} — {event.endTime || "—"}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2 — Tabs */}
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <Tabs defaultValue="organizadores">
                            <div className="border-b border-border px-6 pt-4">
                                <TabsList className="w-full justify-start bg-transparent p-0 h-auto gap-0">
                                    <TabsTrigger
                                        value="organizadores"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium">
                                        Organizadores
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="medalhas"
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium">
                                        Medalhas
                                    </TabsTrigger>
                                    {showAttendance && (
                                        <TabsTrigger
                                            value="presenca"
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-3 text-sm font-medium">
                                            Lista de presença
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </div>

                            {/* Organizadores */}
                            <TabsContent value="organizadores" className="p-6 space-y-4 mt-0">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input placeholder="Buscar organizador..." value={orgSearch}
                                            onChange={e => setOrgSearch(e.target.value)} className="pl-9" />
                                    </div>
                                    <Popover open={orgSortOpen} onOpenChange={setOrgSortOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="icon">
                                                <ArrowUpDown className="w-4 h-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-44 p-2">
                                            <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Ordenar</p>
                                            <button
                                                className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", orgSort === "asc" && "bg-muted font-medium")}
                                                onClick={() => { setOrgSort("asc"); setOrgSortOpen(false); }}>
                                                {orgSort === "asc" && <Check className="w-3 h-3" />}
                                                <span className={orgSort !== "asc" ? "pl-5" : ""}>A → Z</span>
                                            </button>
                                            <button
                                                className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", orgSort === "desc" && "bg-muted font-medium")}
                                                onClick={() => { setOrgSort("desc"); setOrgSortOpen(false); }}>
                                                {orgSort === "desc" && <Check className="w-3 h-3" />}
                                                <span className={orgSort !== "desc" ? "pl-5" : ""}>Z → A</span>
                                            </button>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-1">
                                    {filteredOrganizers.map((org, i) => (
                                        <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors">
                                            <span className="text-sm font-medium text-foreground">{org.name}</span>
                                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", chipColor(org.type))}>
                                                {typeLabel(org.type)}
                                            </span>
                                        </div>
                                    ))}
                                    {filteredOrganizers.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">Nenhum organizador encontrado.</p>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Medalhas */}
                            <TabsContent value="medalhas" className="p-6 space-y-4 mt-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredMedals.length} medalha(s)
                                        {medalCatFilter !== "all" && ` em "${medalCatFilter}"`}
                                    </p>
                                    <Popover open={medalFilterOpen} onOpenChange={setMedalFilterOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className={cn(medalCatFilter !== "all" && "border-primary text-primary")}>
                                                <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
                                                {medalCatFilter === "all" ? "Categoria" : medalCatFilter}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-48 p-2">
                                            <p className="text-xs font-medium text-muted-foreground px-2 pb-1">Filtrar por categoria</p>
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

                                <div className="space-y-2">
                                    {filteredMedals.map(medal => (
                                        <div key={medal.id} className="flex items-start gap-3 px-3 py-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground">{medal.name}</p>
                                                {medal.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{medal.description}</p>
                                                )}
                                            </div>
                                            <Badge variant="secondary" className="text-xs shrink-0">{medal.category}</Badge>
                                        </div>
                                    ))}
                                    {filteredMedals.length === 0 && (
                                        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma medalha encontrada.</p>
                                    )}
                                </div>
                            </TabsContent>

                            {/* Lista de presença */}
                            {showAttendance && (
                                <TabsContent value="presenca" className="p-6 mt-0">
                                    {isScheduled && (
                                        <div className="flex flex-col items-center gap-6 py-4">
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-foreground mb-1">QR Code de presença</p>
                                                <p className="text-xs text-muted-foreground">Escaneie para registrar presença no evento</p>
                                            </div>
                                            <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
                                                <QRCode value={qrUrl} size={180} />
                                            </div>
                                            <p className="text-xs text-muted-foreground break-all max-w-xs text-center">{qrUrl}</p>
                                        </div>
                                    )}

                                    {isConcluded && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">{sortedAttendance.length} presença(s) registrada(s)</p>
                                                <Popover open={attendSortOpen} onOpenChange={setAttendSortOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="icon">
                                                            <ArrowUpDown className="w-4 h-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent align="end" className="w-44 p-2">
                                                        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Ordenar</p>
                                                        <button
                                                            className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", attendSort === "asc" && "bg-muted font-medium")}
                                                            onClick={() => { setAttendSort("asc"); setAttendSortOpen(false); }}>
                                                            {attendSort === "asc" && <Check className="w-3 h-3" />}
                                                            <span className={attendSort !== "asc" ? "pl-5" : ""}>A → Z</span>
                                                        </button>
                                                        <button
                                                            className={cn("w-full text-left text-sm px-2 py-1.5 rounded hover:bg-muted flex items-center gap-2", attendSort === "desc" && "bg-muted font-medium")}
                                                            onClick={() => { setAttendSort("desc"); setAttendSortOpen(false); }}>
                                                            {attendSort === "desc" && <Check className="w-3 h-3" />}
                                                            <span className={attendSort !== "desc" ? "pl-5" : ""}>Z → A</span>
                                                        </button>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            <div className="rounded-lg border border-border overflow-hidden">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-border bg-muted/50">
                                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">CPF</th>
                                                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">LinkedIn</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedAttendance.map(record => (
                                                            <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                                                <td className="px-4 py-3 font-medium text-foreground">{record.name}</td>
                                                                <td className="px-4 py-3 text-muted-foreground">{record.email}</td>
                                                                <td className="px-4 py-3 text-muted-foreground">{record.cpf}</td>
                                                                <td className="px-4 py-3">
                                                                    {record.linkedin ? (
                                                                        <a href={record.linkedin} target="_blank" rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
                                                                            Ver perfil <ExternalLink className="w-3 h-3" />
                                                                        </a>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">—</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {sortedAttendance.length === 0 && (
                                                            <tr>
                                                                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                                                                    Nenhuma presença registrada.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
