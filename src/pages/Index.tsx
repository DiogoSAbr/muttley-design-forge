import { AppSidebar } from "@/components/AppSidebar";
import { MetricCard } from "@/components/MetricCard";
import { MedalCard } from "@/components/MedalCard";
import { Button } from "@/components/ui/button";
import { Award, Linkedin, AlertTriangle, Plus, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const recentEmissions = [
  { name: "Certificação em React Avançado", issuer: "Prof. Diogo Santana", date: "10/04/2026", category: "Tecnologia", linkedInStatus: "published" as const, receiver: "Ana Beatriz" },
  { name: "Liderança de Equipes", issuer: "Prof. Diogo Santana", date: "09/04/2026", category: "Liderança", linkedInStatus: "published" as const, receiver: "João Mendes" },
  { name: "Comunicação Eficaz", issuer: "Prof. Diogo Santana", date: "08/04/2026", category: "Comunicação", linkedInStatus: "pending" as const, receiver: "Maria Costa" },
  { name: "Gestão de Projetos Ágeis", issuer: "Prof. Diogo Santana", date: "07/04/2026", category: "Gestão", linkedInStatus: "error" as const, receiver: "Pedro Santos" },
  { name: "Python para Data Science", issuer: "Prof. Diogo Santana", date: "06/04/2026", category: "Tecnologia", linkedInStatus: "published" as const, receiver: "Camila Rocha" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Bem-vindo, Prof. Diogo Santana</p>
            </div>
            <Button onClick={() => navigate("/emit")} size="lg">
              <Plus className="w-4 h-4" />
              Emitir medalha
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <MetricCard
              label="Total emitido"
              value={247}
              icon={<Award className="w-5 h-5" />}
              trend={{ value: "+12 esta semana", positive: true }}
            />
            <MetricCard
              label="Publicados no LinkedIn"
              value={231}
              icon={<Linkedin className="w-5 h-5" />}
              trend={{ value: "93.5% de sucesso", positive: true }}
            />
            <MetricCard
              label="Pendentes / Erro"
              value={16}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: "1 com erro", positive: false }}
            />
          </div>

          {/* Recent emissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-foreground">Últimas emissões</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                Ver todas
              </Button>
            </div>
            <div className="space-y-2">
              {recentEmissions.map((emission, idx) => (
                <MedalCard
                  key={idx}
                  name={emission.name}
                  issuer={`${emission.receiver}`}
                  date={emission.date}
                  category={emission.category}
                  linkedInStatus={emission.linkedInStatus}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
