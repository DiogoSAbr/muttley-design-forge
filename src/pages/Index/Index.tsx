import { AppSidebar } from "@/components/AppSidebar";
import { MetricCard } from "@/components/MetricCard";
import { MedalCard } from "@/components/MedalCard";
import { Button } from "@/components/ui/button";
import { Award, Linkedin, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import emissionData from "@/mock/Emission.json";
import type { Emission } from "@/models/Emission/Emission";

const recentEmissions: Emission[] = emissionData.mockEmissions.slice(0, 5) as Emission[];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
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

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-foreground">Últimas emissões</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                Ver todas
              </Button>
            </div>
            <div className="space-y-2">
              {recentEmissions.map((emission) => (
                <MedalCard
                  key={emission.id}
                  name={emission.medalName}
                  issuer={emission.receiverName}
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
