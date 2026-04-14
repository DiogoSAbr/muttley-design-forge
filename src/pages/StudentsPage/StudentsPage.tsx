import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, Search, Upload, Linkedin, Github } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/models/Student/Student";
import studentData from "@/mock/Student.json";

const initialStudents: Student[] = studentData.mockStudents as Student[];

const emptyStudent: Omit<Student, "id"> = { name: "", ra: "", email: "", linkedin: "", github: "" };

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
    const [form, setForm] = useState(emptyStudent);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const filtered = students.filter(
        (s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.ra.includes(search) ||
            s.email.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setEditingStudent(null);
        setForm(emptyStudent);
        setDialogOpen(true);
    }

    function openEdit(student: Student) {
        setEditingStudent(student);
        setForm({ name: student.name, ra: student.ra, email: student.email, linkedin: student.linkedin, github: student.github });
        setDialogOpen(true);
    }

    function confirmDelete(student: Student) {
        setDeletingStudent(student);
        setDeleteDialogOpen(true);
    }

    function handleDelete() {
        if (deletingStudent) {
            setStudents(students.filter((s) => s.id !== deletingStudent.id));
            toast({ title: "Aluno excluído", description: `${deletingStudent.name} foi removido.` });
        }
        setDeleteDialogOpen(false);
        setDeletingStudent(null);
    }

    function handleSave() {
        if (!form.name || !form.ra || !form.email) return;
        if (editingStudent) {
            setStudents(students.map((s) => (s.id === editingStudent.id ? { ...s, ...form } : s)));
            toast({ title: "Aluno atualizado", description: `${form.name} foi atualizado.` });
        } else {
            setStudents([...students, { ...form, id: crypto.randomUUID() }]);
            toast({ title: "Aluno cadastrado", description: `${form.name} foi adicionado.` });
        }
        setDialogOpen(false);
    }

    function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
            toast({ title: "Formato inválido", description: "Por favor, envie um arquivo .xlsx", variant: "destructive" });
            return;
        }
        const mockImported: Student[] = [
            { id: crypto.randomUUID(), name: "Lucas Ferreira", ra: "2024010", email: "lucas.ferreira@email.com", linkedin: "", github: "" },
            { id: crypto.randomUUID(), name: "Juliana Almeida", ra: "2024011", email: "juliana.almeida@email.com", linkedin: "", github: "" },
        ];
        setStudents((prev) => [...prev, ...mockImported]);
        toast({ title: "Importação concluída", description: `${mockImported.length} alunos importados com sucesso.` });
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Alunos</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{students.length} alunos cadastrados</p>
                        </div>
                        <div className="flex gap-2">
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-4 h-4" />
                                Importar XLSX
                            </Button>
                            <Button onClick={openCreate}>
                                <Plus className="w-4 h-4" />
                                Novo aluno
                            </Button>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Buscar por nome, RA ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                    </div>

                    <div className="bg-card rounded-lg border border-border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Aluno</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">RA</th>
                                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Links</th>
                                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((student) => (
                                    <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar name={student.name} size="sm" />
                                                <span className="font-medium text-foreground">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{student.ra}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-center gap-2">
                                                {student.linkedin && (
                                                    <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#0A66C2] hover:opacity-80">
                                                        <Linkedin className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {student.github && (
                                                    <a href={student.github} target="_blank" rel="noopener noreferrer" className="text-foreground hover:opacity-80">
                                                        <Github className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(student)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(student)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted-foreground py-12">Nenhum aluno encontrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingStudent ? "Editar aluno" : "Novo aluno"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nome completo</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do aluno" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>RA</Label>
                                <Input value={form.ra} onChange={(e) => setForm({ ...form, ra: e.target.value })} placeholder="Ex: 2024001" />
                            </div>
                            <div>
                                <Label>E-mail</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="aluno@email.com" />
                            </div>
                        </div>
                        <div>
                            <Label>LinkedIn (URL)</Label>
                            <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                        </div>
                        <div>
                            <Label>GitHub (URL)</Label>
                            <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!form.name || !form.ra || !form.email}>{editingStudent ? "Salvar" : "Cadastrar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir aluno</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir <strong>{deletingStudent?.name}</strong>? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
