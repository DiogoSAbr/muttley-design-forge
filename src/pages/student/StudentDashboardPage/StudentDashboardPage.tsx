import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Calendar, Linkedin, TrendingUp, AlertTriangle } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { MetricCard } from "@/components/MetricCard";
import { MedalCard } from "@/components/MedalCard";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import emissionData from "@/mock/Emission.json";
import attendanceData from "@/mock/Attendance.json";
import type { Emission } from "@/models/Emission/Emission";

export default function StudentDashboardPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [passwordAlertOpen, setPasswordAlertOpen] = useState(
    user?.mustChangePassword ?? false
  );

  const allEmissions: Emission[] = emissionData.mockEmissions as Emission[];
  const myEmissions = allEmissions.filter(
    (e) => e.receiverName === user?.name
  );

  const attendedEventIds = Object.entries(
    attendanceData.attendances as Record<string, { name: string }[]>
  )
    .filter(([, attendees]) => attendees.some((a) => a.name === user?.name))
    .map(([eventId]) => eventId);

  const publishedCount = myEmissions.filter(
    (e) => e.linkedInStatus === "published"
  ).length;

  const handleGoToProfile = () => {
    setPasswordAlertOpen(false);
    updateUser({ mustChangePassword: false });
    navigate("/student/profile");
  };

  const handleDismissAlert = () => {
    setPasswordAlertOpen(false);
    updateUser({ mustChangePassword: false });
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bem-vindo, {user?.name}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <MetricCard
              label="Medalhas recebidas"
              value={myEmissions.length}
              icon={<Award className="w-5 h-5" />}
              trend={
                myEmissions.length > 0
                  ? { value: "Conquistas obtidas", positive: true }
                  : undefined
              }
            />
            <MetricCard
              label="Publicadas no LinkedIn"
              value={publishedCount}
              icon={<Linkedin className="w-5 h-5" />}
              trend={
                myEmissions.length > 0
                  ? {
                      value: `${Math.round((publishedCount / myEmissions.length) * 100)}% de sucesso`,
                      positive: true,
                    }
                  : undefined
              }
            />
            <MetricCard
              label="Eventos participados"
              value={attendedEventIds.length}
              icon={<Calendar className="w-5 h-5" />}
              trend={
                attendedEventIds.length > 0
                  ? { value: "Eventos concluídos", positive: true }
                  : undefined
              }
            />
          </div>

          {myEmissions.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-medium text-foreground">
                  Minhas medalhas recentes
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/student/medals")}
                >
                  Ver todas
                </Button>
              </div>
              <div className="space-y-2">
                {myEmissions.slice(0, 5).map((emission) => (
                  <MedalCard
                    key={emission.id}
                    name={emission.medalName}
                    issuer={emission.issuerName}
                    date={emission.date}
                    category={emission.category}
                    linkedInStatus={emission.linkedInStatus}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                Nenhuma medalha recebida ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Participe de eventos e atividades para conquistar suas primeiras medalhas.
              </p>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={passwordAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-foreground" />
              Troque sua senha
            </AlertDialogTitle>
            <AlertDialogDescription>
              Por segurança, você deve trocar sua senha padrão antes de continuar.
              Clique em "Trocar agora" para ir às configurações do seu perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" size="sm" onClick={handleDismissAlert}>
              Depois
            </Button>
            <AlertDialogAction onClick={handleGoToProfile}>
              Trocar agora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
