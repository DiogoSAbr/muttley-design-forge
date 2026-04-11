import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { EmissionStepper } from "@/components/EmissionStepper";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Search, X, Check, Award, ArrowRight, ArrowLeft, Loader2, Shield, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Buscar aluno", "Selecionar medalha", "Confirmar"];

const mockStudents = [
  { ra: "STU-001", name: "Ana Beatriz Ferreira", email: "ana.ferreira@email.com", phone: "(11) 98765-4321" },
  { ra: "STU-002", name: "João Mendes Costa", email: "joao.mendes@email.com", phone: "(21) 91234-5678" },
  { ra: "STU-003", name: "Maria Clara Oliveira", email: "maria.oliveira@email.com", phone: "(31) 99876-5432" },
];

const mockMedals = [
  { id: "1", name: "Certificação em React Avançado", description: "Domínio de hooks, context API e patterns avançados.", category: "Tecnologia", keywords: ["React", "Frontend", "JavaScript"] },
  { id: "2", name: "Liderança de Equipes", description: "Habilidades de gestão e motivação de times.", category: "Liderança", keywords: ["Liderança", "Gestão", "Soft Skills"] },
  { id: "3", name: "Comunicação Eficaz", description: "Técnicas de apresentação e comunicação interpessoal.", category: "Comunicação", keywords: ["Comunicação", "Apresentação"] },
  { id: "4", name: "Gestão de Projetos Ágeis", description: "Scrum, Kanban e metodologias ágeis aplicadas.", category: "Gestão", keywords: ["Agile", "Scrum", "Kanban"] },
  { id: "5", name: "Python para Data Science", description: "Análise de dados com Pandas, NumPy e visualização.", category: "Tecnologia", keywords: ["Python", "Data Science", "Machine Learning"] },
  { id: "6", name: "Design Thinking", description: "Metodologia centrada no usuário para inovação.", category: "Gestão", keywords: ["Design Thinking", "Inovação", "UX"] },
];

type EmissionPhase = "idle" | "registering" | "publishing" | "notifying" | "success" | "partial-error";

export default function EmitPage() {
  const [step, setStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [confirmedStudent, setConfirmedStudent] = useState(false);
  const [selectedMedal, setSelectedMedal] = useState<typeof mockMedals[0] | null>(null);
  const [emissionPhase, setEmissionPhase] = useState<EmissionPhase>("idle");

  const filteredStudents = searchQuery.length > 1
    ? mockStudents.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ra.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleEmit = () => {
    setEmissionPhase("registering");
    setTimeout(() => setEmissionPhase("publishing"), 1000);
    setTimeout(() => setEmissionPhase("notifying"), 3000);
    setTimeout(() => setEmissionPhase("success"), 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <h1 className="text-xl font-semibold text-foreground mb-2">Emitir medalha</h1>
          <p className="text-sm text-muted-foreground mb-8">Siga as etapas para conceder uma medalha digital.</p>

          <EmissionStepper currentStep={step} steps={STEPS} className="mb-10" />

          {/* STEP 1: Search student */}
          {step === 0 && (
            <div className="space-y-4">
              {!confirmedStudent ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Buscar aluno</label>
                    <p className="text-xs text-muted-foreground">Pesquise por nome, e-mail ou ID do aluno.</p>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setSelectedStudent(null); }}
                        placeholder="Nome, e-mail ou RA..."
                        className="w-full h-10 pl-9 pr-9 rounded-md border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(""); setSelectedStudent(null); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {searchQuery.length > 1 && (
                    <div className="border border-border rounded-lg overflow-hidden bg-card divide-y divide-border">
                      {filteredStudents.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                          Nenhum aluno encontrado para "{searchQuery}".
                        </div>
                      ) : (
                        filteredStudents.map((student) => (
                          <button
                            key={student.ra}
                            onClick={() => setSelectedStudent(student)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors",
                              selectedStudent?.ra === student.ra && "bg-accent"
                            )}
                          >
                            <UserAvatar name={student.name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-card-foreground truncate">{student.name}</p>
                              <p className="text-xs text-muted-foreground">{student.email} · {student.ra}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {selectedStudent && (
                    <div className="bg-accent/30 border border-border rounded-lg p-4">
                      <p className="text-sm font-medium text-foreground mb-3">Este é o aluno correto?</p>
                      <div className="flex items-center gap-3 mb-4">
                        <UserAvatar name={selectedStudent.name} size="md" />
                        <div>
                          <p className="text-sm font-medium">{selectedStudent.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedStudent.email} · {selectedStudent.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setConfirmedStudent(true)}>Sim, é este</Button>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedStudent(null)}>Não, buscar outro</Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-success-light border border-success/20 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{selectedStudent!.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedStudent!.email}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setConfirmedStudent(false); setSelectedStudent(null); setSearchQuery(""); }}>Alterar</Button>
                </div>
              )}

              {confirmedStudent && (
                <div className="flex justify-end pt-2">
                  <Button onClick={() => setStep(1)}>
                    Próximo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Select medal */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Escolha o tipo de medalha para {selectedStudent?.name}.</p>
              <div className="grid grid-cols-2 gap-3">
                {mockMedals.map((medal) => (
                  <button
                    key={medal.id}
                    onClick={() => setSelectedMedal(medal)}
                    className={cn(
                      "relative text-left p-4 rounded-xl border-2 bg-card transition-all duration-200 hover:shadow-elevated",
                      selectedMedal?.id === medal.id
                        ? "border-primary shadow-elevated"
                        : "border-border hover:border-border-strong"
                    )}
                  >
                    {selectedMedal?.id === medal.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-medal/10 flex items-center justify-center mb-2">
                      <Award className="w-4 h-4 text-medal" />
                    </div>
                    <p className="text-sm font-medium text-card-foreground">{medal.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{medal.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {medal.keywords.map((kw) => (
                        <span key={kw} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-full">{kw}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button onClick={() => setStep(2)} disabled={!selectedMedal}>
                  Próximo <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirm */}
          {step === 2 && emissionPhase === "idle" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <UserAvatar name={selectedStudent!.name} size="lg" className="mx-auto mb-3" />
                <p className="text-base font-medium text-foreground">{selectedStudent!.name}</p>
                <p className="text-xs text-muted-foreground mb-4">{selectedStudent!.email}</p>
                <div className="inline-flex items-center gap-2 bg-medal/10 text-medal-dark px-4 py-2 rounded-lg">
                  <Award className="w-5 h-5 text-medal" />
                  <span className="text-sm font-medium">{selectedMedal!.name}</span>
                </div>
              </div>

              <div className="bg-warning-light border border-warning/20 rounded-lg px-4 py-3 flex items-start gap-3">
                <Shield className="w-4 h-4 text-warning-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-warning-foreground leading-relaxed">
                  <span className="font-medium">Aviso LGPD:</span> Ao confirmar, os dados de{" "}
                  <span className="font-medium">{selectedStudent!.name}</span> serão compartilhados com o LinkedIn conforme a Lei Geral de Proteção de Dados.{" "}
                  <button className="underline font-medium">Saiba mais</button>
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button size="lg" onClick={handleEmit}>
                  <Award className="w-4 h-4" /> Emitir medalha
                </Button>
              </div>
            </div>
          )}

          {/* Emission progress */}
          {step === 2 && emissionPhase !== "idle" && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              {emissionPhase === "success" ? (
                <div className="animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success animate-check" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">Medalha emitida com sucesso!</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {selectedStudent!.name} receberá uma notificação e a medalha será publicada no LinkedIn.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="linkedin">Ver no LinkedIn</Button>
                    <Button variant="secondary" onClick={() => { setStep(0); setEmissionPhase("idle"); setConfirmedStudent(false); setSelectedStudent(null); setSelectedMedal(null); setSearchQuery(""); }}>
                      Emitir outra
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  <div className="space-y-2">
                    {["registering", "publishing", "notifying"].map((phase) => {
                      const labels: Record<string, string> = {
                        registering: "Registrando emissão…",
                        publishing: "Publicando no LinkedIn…",
                        notifying: "Enviando notificação…",
                      };
                      const phases = ["registering", "publishing", "notifying"];
                      const currentIdx = phases.indexOf(emissionPhase);
                      const phaseIdx = phases.indexOf(phase);
                      const isDone = phaseIdx < currentIdx;
                      const isCurrent = phase === emissionPhase;

                      return (
                        <div key={phase} className={cn("flex items-center gap-2 justify-center text-sm transition-opacity", isCurrent ? "text-foreground font-medium" : isDone ? "text-success" : "text-muted-foreground/50")}>
                          {isDone && <Check className="w-4 h-4 text-success" />}
                          {isCurrent && <span className="spinner w-3 h-3" />}
                          {labels[phase]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
