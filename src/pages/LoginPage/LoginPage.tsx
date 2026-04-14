import { useState } from "react";
import { Award, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import userData from "@/mock/User.json";

const defaultUser = userData.mockUsers[0];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:flex-1 bg-primary-foreground items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-medal/10" />
        <div className="relative z-10 text-center px-12 max-w-md">
          <img src="./FATEC_ZONA_LESTE_LOGO.png" alt="Muttley" className="w-48 h-32 bg-transparent flex items-center justify-center mx-auto mb-6" />
          <h1 className="text-3xl font-semibold text-sidebar-primary-foreground mb-3 tracking-tight">
            Muttley
          </h1>
          <p className="text-sidebar-muted text-base leading-relaxed">
            Emita medalhas digitais de competências e publique automaticamente no LinkedIn dos seus alunos.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Award className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight">Muttley</span>
          </div>

          <h2 className="text-xl font-semibold text-foreground">Entrar na plataforma</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Acesse sua conta para emitir medalhas digitais
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="w-full h-10 px-3 rounded-md border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                defaultValue={defaultUser.email}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-foreground">Senha</label>
                <button type="button" className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-10 px-3 pr-10 rounded-md border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow"
                  defaultValue={defaultUser.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary" size="lg" loading={loading}>
              Entrar
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ainda não tem conta?{" "}
            <button className="text-primary font-medium hover:underline">Solicitar acesso</button>
          </p>
        </div>
      </div>
    </div>
  );
}
