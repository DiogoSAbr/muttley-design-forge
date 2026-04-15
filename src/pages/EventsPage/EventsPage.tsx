import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Pencil, Trash2, Search, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEvents } from "./EventsContext";

const statusMap: Record<string, { label: string; variant: "success" | "error" | "warning" }> = {
    agendado: { label: "Agendado", variant: "warning" },
    cancelado: { label: "Cancelado", variant: "error" },
    concluido: { label: "Concluído", variant: "success" },
};

const formatDate = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

export default function EventsPage() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const { events, deleteEvent, cancelEvent } = useEvents();

    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [cancelId, setCancelId] = useState<string | null>(null);

    const filtered = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.modality.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = () => {
        if (!deleteId) return;
        deleteEvent(deleteId);
        setDeleteId(null);
        toast({ title: "Evento excluído" });
    };

    const handleCancel = () => {
        if (!cancelId) return;
        cancelEvent(cancelId);
        setCancelId(null);
        toast({ title: "Evento cancelado" });
    };

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
                        <Button onClick={() => navigate("/events/new")}>
                            <Plus className="w-4 h-4 mr-2" /> Novo evento
                        </Button>
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
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/events/${ev.id}/edit`)} title="Editar">
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
