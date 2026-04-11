import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { MedalCard } from "@/components/MedalCard";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, ArrowUpDown, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const historyData = [
  { name: "Certificação em React Avançado", receiver: "Ana Beatriz Ferreira", date: "10/04/2026 14:32", category: "Tecnologia", linkedInStatus: "published" as const },
  { name: "Liderança de Equipes", receiver: "João Mendes Costa", date: "09/04/2026 11:15", category: "Liderança", linkedInStatus: "published" as const },
  { name: "Comunicação Eficaz", receiver: "Maria Clara Oliveira", date: "08/04/2026 09:45", category: "Comunicação", linkedInStatus: "pending" as const },
  { name: "Gestão de Projetos Ágeis", receiver: "Pedro Santos Lima", date: "07/04/2026 16:20", category: "Gestão", linkedInStatus: "error" as const },
  { name: "Python para Data Science", receiver: "Camila Rocha Dias", date: "06/04/2026 10:00", category: "Tecnologia", linkedInStatus: "published" as const },
  { name: "Design Thinking", receiver: "Lucas Oliveira", date: "05/04/2026 15:30", category: "Gestão", linkedInStatus: "published" as const },
  { name: "Comunicação Eficaz", receiver: "Fernanda Alves", date: "04/04/2026 13:10", category: "Comunicação", linkedInStatus: "published" as const },
  { name: "Liderança de Equipes", receiver: "Ricardo Souza", date: "03/04/2026 08:55", category: "Liderança", linkedInStatus: "pending" as const },
];

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30d");
  const navigate = useNavigate();

  const filtered = historyData.filter(
    (h) =>
      h.receiver.toLowerCase().includes(search.toLowerCase()) ||
      h.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Histórico de emissões</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Acompanhe todas as medalhas emitidas</p>
            </div>
            <Button onClick={() => navigate("/emit")}>
              <Award className="w-4 h-4" /> Emitir medalha
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por receptor ou medalha..."
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <option value="today">Hoje</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="custom">Personalizado</option>
            </select>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">Nenhuma emissão encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">Que tal emitir sua primeira medalha?</p>
              <Button onClick={() => navigate("/emit")}>Emitir medalha</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground w-32 flex-shrink-0 text-right">{item.date}</span>
                  <MedalCard
                    name={item.name}
                    issuer={item.receiver}
                    date=""
                    category={item.category}
                    linkedInStatus={item.linkedInStatus}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
