import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserAvatar } from "@/components/UserAvatar";
import { Plus, Pencil, Search, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  active: boolean;
}

const initialTeachers: Teacher[] = [
  { id: "1", name: "Prof. Diogo Santana", email: "diogo.santana@univ.edu", department: "Ciência da Computação", active: true },
  { id: "2", name: "Prof. Carlos Silva", email: "carlos.silva@univ.edu", department: "Engenharia de Software", active: true },
  { id: "3", name: "Profa. Fernanda Lima", email: "fernanda.lima@univ.edu", department: "Design", active: true },
  { id: "4", name: "Prof. Ricardo Alves", email: "ricardo.alves@univ.edu", department: "Administração", active: false },
];

const emptyTeacher: Omit<Teacher, "id" | "active"> = { name: "", email: "", department: "" };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [togglingTeacher, setTogglingTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState(emptyTeacher);
  const { toast } = useToast();

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingTeacher(null);
    setForm(emptyTeacher);
    setDialogOpen(true);
  }

  function openEdit(teacher: Teacher) {
    setEditingTeacher(teacher);
    setForm({ name: teacher.name, email: teacher.email, department: teacher.department });
    setDialogOpen(true);
  }

  function confirmToggle(teacher: Teacher) {
    setTogglingTeacher(teacher);
    setToggleDialogOpen(true);
  }

  function handleToggle() {
    if (togglingTeacher) {
      const newActive = !togglingTeacher.active;
      setTeachers(teachers.map((t) => (t.id === togglingTeacher.id ? { ...t, active: newActive } : t)));
      toast({
        title: newActive ? "Professor reativado" : "Professor inativado",
        description: `${togglingTeacher.name} foi ${newActive ? "reativado" : "inativado"}.`,
      });
    }
    setToggleDialogOpen(false);
    setTogglingTeacher(null);
  }

  function handleSave() {
    if (!form.name || !form.email) return;
    if (editingTeacher) {
      setTeachers(teachers.map((t) => (t.id === editingTeacher.id ? { ...t, ...form } : t)));
      toast({ title: "Professor atualizado", description: `${form.name} foi atualizado.` });
    } else {
      setTeachers([...teachers, { ...form, id: crypto.randomUUID(), active: true }]);
      toast({ title: "Professor cadastrado", description: `${form.name} foi adicionado.` });
    }
    setDialogOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Professores</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {teachers.filter((t) => t.active).length} ativos · {teachers.filter((t) => !t.active).length} inativos
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="w-4 h-4" />
              Novo professor
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, e-mail ou departamento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Professor</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Departamento</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => (
                  <tr key={teacher.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!teacher.active ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={teacher.name} size="sm" />
                        <span className="font-medium text-foreground">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{teacher.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{teacher.department}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${teacher.active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {teacher.active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(teacher)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => confirmToggle(teacher)} title={teacher.active ? "Inativar" : "Reativar"}>
                          {teacher.active ? <UserX className="w-4 h-4 text-destructive" /> : <UserCheck className="w-4 h-4 text-emerald-600" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted-foreground py-12">Nenhum professor encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Editar professor" : "Novo professor"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Nome completo</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Prof. Nome Sobrenome" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@universidade.edu" />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Ex: Ciência da Computação" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>{editingTeacher ? "Salvar" : "Cadastrar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Active Confirmation */}
      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{togglingTeacher?.active ? "Inativar professor" : "Reativar professor"}</AlertDialogTitle>
            <AlertDialogDescription>
              {togglingTeacher?.active
                ? `Tem certeza que deseja inativar ${togglingTeacher?.name}? O professor não poderá mais emitir medalhas.`
                : `Deseja reativar ${togglingTeacher?.name}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle}>
              {togglingTeacher?.active ? "Inativar" : "Reativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
