import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Search, Medal } from "lucide-react";
import type { Medal as MedalModel } from "@/models/Medal/Medal";
import medalData from "@/mock/Medal.json";

const initialMedals: MedalModel[] = medalData.mockMedals as MedalModel[];

const categories = ["Tecnologia", "Liderança", "Comunicação", "Gestão", "Acadêmico"];

const emptyMedal: Omit<MedalModel, "id"> = { name: "", description: "", category: "", keywords: [], active: true };

export default function MedalsPage() {
    const [medals, setMedals] = useState<MedalModel[]>(initialMedals);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMedal, setEditingMedal] = useState<MedalModel | null>(null);
    const [form, setForm] = useState(emptyMedal);
    const [keywordInput, setKeywordInput] = useState("");

    const filtered = medals.filter(
        (m) =>
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.category.toLowerCase().includes(search.toLowerCase())
    );

    function openCreate() {
        setEditingMedal(null);
        setForm(emptyMedal);
        setKeywordInput("");
        setDialogOpen(true);
    }

    function openEdit(medal: MedalModel) {
        setEditingMedal(medal);
        setForm({ name: medal.name, description: medal.description, category: medal.category, keywords: medal.keywords, active: medal.active });
        setKeywordInput("");
        setDialogOpen(true);
    }

    function addKeyword() {
        const trimmed = keywordInput.trim();
        if (trimmed && !form.keywords.includes(trimmed)) {
            setForm({ ...form, keywords: [...form.keywords, trimmed] });
            setKeywordInput("");
        }
    }

    function removeKeyword(keyword: string) {
        setForm({ ...form, keywords: form.keywords.filter((k) => k !== keyword) });
    }

    function handleSave() {
        if (!form.name || !form.category) return;
        if (editingMedal) {
            setMedals(medals.map((m) => (m.id === editingMedal.id ? { ...m, ...form } : m)));
        } else {
            setMedals([...medals, { ...form, id: crypto.randomUUID() }]);
        }
        setDialogOpen(false);
    }

    const categoryColor: Record<string, string> = {
        Tecnologia: "border-l-blue-500",
        Liderança: "border-l-amber-500",
        Comunicação: "border-l-emerald-500",
        Gestão: "border-l-violet-500",
        Acadêmico: "border-l-primary",
    };

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Gerenciar medalhas</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">{medals.length} tipos cadastrados</p>
                        </div>
                        <Button onClick={openCreate}>
                            <Plus className="w-4 h-4" />
                            Nova medalha
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou categoria..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="space-y-2">
                        {filtered.map((medal) => (
                            <div
                                key={medal.id}
                                className={`flex items-center gap-4 bg-card rounded-lg border border-border p-4 border-l-4 ${categoryColor[medal.category] || "border-l-muted"} ${!medal.active ? "opacity-50" : ""}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-medal/10 flex items-center justify-center flex-shrink-0">
                                    <Medal className="w-5 h-5 text-medal" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-foreground truncate">{medal.name}</p>
                                        {!medal.active && (
                                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Inativa</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{medal.description}</p>
                                    <div className="flex gap-1.5 mt-1.5">
                                        {medal.keywords.map((k) => (
                                            <span key={k} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground flex-shrink-0">{medal.category}</span>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(medal)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-12">Nenhuma medalha encontrada.</p>
                        )}
                    </div>
                </div>
            </main>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingMedal ? "Editar medalha" : "Nova medalha"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <Label>Nome</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Certificação em React" />
                        </div>
                        <div>
                            <Label>Descrição</Label>
                            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descreva a competência..." rows={3} />
                        </div>
                        <div>
                            <Label>Categoria</Label>
                            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Competências</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    placeholder="Adicionar competência..."
                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                                />
                                <Button type="button" variant="outline" size="sm" onClick={addKeyword}>Adicionar</Button>
                            </div>
                            {form.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {form.keywords.map((k) => (
                                        <span key={k} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors" onClick={() => removeKeyword(k)}>
                                            {k} ×
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {editingMedal && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                                    className="rounded border-border"
                                    id="active-check"
                                />
                                <Label htmlFor="active-check" className="text-sm font-normal">Medalha ativa</Label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!form.name || !form.category}>{editingMedal ? "Salvar" : "Criar"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
