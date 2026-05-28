import { useState } from "react";
import { Github, Linkedin, Lock, Save, Eye, EyeOff, User } from "lucide-react";
import { StudentSidebar } from "@/components/StudentSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import studentData from "@/mock/Student.json";

export default function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const student = studentData.mockStudents.find(
    (s) => s.id === user?.studentId
  );

  const [github, setGithub] = useState(user?.github ?? student?.github ?? "");
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? student?.linkedin ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ github, linkedin });
    toast({ title: "Perfil atualizado com sucesso!" });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Informe sua senha atual.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return;
    }

    updateUser({ mustChangePassword: false });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Senha alterada com sucesso!" });
  };

  return (
    <div className="min-h-screen bg-background">
      <StudentSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gerencie suas informações pessoais e de acesso
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-5">
            <div className="flex items-center gap-4 mb-5">
              <UserAvatar name={user?.name ?? "Aluno"} size="lg" />
              <div>
                <p className="text-base font-semibold text-foreground">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.username}</p>
                {student && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    RA: {student.ra} · {student.curso}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground font-medium mb-0.5 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Papel
                </p>
                <p className="text-foreground font-medium capitalize">Aluno</p>
              </div>
              {student?.phone && (
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Telefone</p>
                  <p className="text-foreground">{student.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Links sociais</h2>
            <form onSubmit={handleSaveLinks} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Github className="w-4 h-4" /> GitHub
                </label>
                <Input
                  type="url"
                  placeholder="https://github.com/seu-usuario"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </label>
                <Input
                  type="url"
                  placeholder="https://linkedin.com/in/seu-usuario"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
              <Button type="submit" size="sm" className="gap-1.5">
                <Save className="w-4 h-4" /> Salvar links
              </Button>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Alterar senha
            </h2>
            {user?.mustChangePassword && (
              <p className="text-xs text-warning-foreground bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mb-4">
                Você ainda não trocou sua senha padrão. Recomendamos trocar agora.
              </p>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Senha atual</label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nova senha</label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirmar nova senha</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}

              <Button type="submit" size="sm" className="gap-1.5">
                <Lock className="w-4 h-4" /> Alterar senha
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
