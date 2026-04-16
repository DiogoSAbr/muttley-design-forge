import { Award, Linkedin, Clock } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import emissionData from "@/mock/Emission.json";
import type { Emission } from "@/models/Emission/Emission";

const linkedInVariant: Record<string, "success" | "warning" | "error"> = {
  published: "success",
  pending: "warning",
  error: "error",
};

const linkedInLabel: Record<string, string> = {
  published: "Publicado",
  pending: "Pendente",
  error: "Erro",
};

const categoryColors: Record<string, string> = {
  Tecnologia: "bg-primary/10 text-primary",
  Liderança: "bg-medal/10 text-medal-dark",
  Comunicação: "bg-info/10 text-info",
  Gestão: "bg-success/10 text-success",
};

export default function StudentMedalsPage() {
  const { user } = useAuth();

  const allEmissions: Emission[] = emissionData.mockEmissions as Emission[];
  const myEmissions = allEmissions.filter(
    (e) => e.receiverName === user?.name
  );

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">Minhas Medalhas</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {myEmissions.length}{" "}
              {myEmissions.length === 1 ? "medalha recebida" : "medalhas recebidas"}
            </p>
          </div>

          {myEmissions.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground">
                Nenhuma medalha recebida ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Participe de eventos e atividades para conquistar suas primeiras medalhas.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-3 font-medium text-muted-foreground">Medalha</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Categoria</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Emitida por</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">LinkedIn</th>
                  </tr>
                </thead>
                <tbody>
                  {myEmissions.map((emission) => (
                    <tr
                      key={emission.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-medal/10 flex items-center justify-center flex-shrink-0">
                            <Award className="w-4 h-4 text-medal-dark" />
                          </div>
                          <span className="font-medium text-foreground">
                            {emission.medalName}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            categoryColors[emission.category] ?? "bg-muted text-muted-foreground"
                          }`}
                        >
                          {emission.category}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{emission.issuerName}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {emission.date}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
                          <StatusBadge
                            variant={linkedInVariant[emission.linkedInStatus] ?? "warning"}
                          >
                            {linkedInLabel[emission.linkedInStatus] ?? emission.linkedInStatus}
                          </StatusBadge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
