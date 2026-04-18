import { useState } from "react";
import { Calendar, CheckCircle, Clock, MapPin, Star } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import eventData from "@/mock/Event.json";
import attendanceData from "@/mock/Attendance.json";

const formatDate = (d: string) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

const modalityVariant: Record<string, "success" | "warning" | "error"> = {
  Presencial: "success",
  Online: "warning",
  Híbrido: "error",
};

export default function StudentEventsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"upcoming" | "attended">("upcoming");
  const [interests, setInterests] = useState<Set<string>>(new Set());

  const allEvents = eventData.mockEvents;

  const upcomingEvents = allEvents.filter((e) => e.status === "agendado");

  const attendedEventIds = new Set(
    Object.entries(
      attendanceData.attendances as Record<string, { name: string }[]>
    )
      .filter(([, attendees]) => attendees.some((a) => a.name === user?.name))
      .map(([id]) => id)
  );

  const attendedEvents = allEvents.filter((e) => attendedEventIds.has(e.id));

  const toggleInterest = (id: string) => {
    setInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ title: "Interesse removido" });
      } else {
        next.add(id);
        toast({ title: "Interesse registrado!" });
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">Eventos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Acompanhe eventos futuros e o histórico de participações
            </p>
          </div>

          <div className="flex gap-1 mb-6 bg-muted/40 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "upcoming"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Próximos eventos
            </button>
            <button
              onClick={() => setActiveTab("attended")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "attended"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Minha participação
            </button>
          </div>

          {activeTab === "upcoming" && (
            <div className="space-y-3">
              {upcomingEvents.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhum evento agendado no momento.</p>
                </div>
              )}
              {upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {ev.description}
                        </p>
                      </div>
                      <StatusBadge variant={modalityVariant[ev.modality] ?? "warning"}>
                        {ev.modality}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(ev.startDate)}
                        {ev.endDate ? ` — ${formatDate(ev.endDate)}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {ev.startTime} às {ev.endTime}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={interests.has(ev.id) ? "default" : "outline"}
                    className="flex-shrink-0 gap-1.5"
                    onClick={() => toggleInterest(ev.id)}
                  >
                    <Star
                      className="w-3.5 h-3.5"
                      fill={interests.has(ev.id) ? "currentColor" : "none"}
                    />
                    {interests.has(ev.id) ? "Interesse marcado" : "Tenho interesse"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "attended" && (
            <div className="space-y-3">
              {attendedEvents.length === 0 && (
                <div className="bg-card border border-border rounded-xl p-10 text-center">
                  <CheckCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Você ainda não participou de nenhum evento.
                  </p>
                </div>
              )}
              {attendedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {ev.description}
                        </p>
                      </div>
                      <StatusBadge variant="success">Participei</StatusBadge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(ev.startDate)}
                        {ev.endDate ? ` — ${formatDate(ev.endDate)}` : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {ev.modality}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
