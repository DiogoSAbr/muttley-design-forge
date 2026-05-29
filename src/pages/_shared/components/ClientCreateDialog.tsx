import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ClientService } from "@/services/ClientService";
import { ApiError } from "@/lib/api/client";
import { isValidCpf, maskCpf, unmaskCpf } from "@/lib/cpf";
import type { Client } from "@/models/Client/Client";

interface ClientCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: (client: Client) => void;
}

const initial = { nome: "", cpf: "", email: "" };

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ClientCreateDialog({ open, onOpenChange, onCreated }: ClientCreateDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [form, setForm] = useState(initial);
    const [submitting, setSubmitting] = useState(false);

    function reset() {
        setForm(initial);
    }

    function handleOpenChange(o: boolean) {
        if (!o) reset();
        onOpenChange(o);
    }

    async function handleSubmit() {
        if (!form.nome.trim() || !isValidCpf(form.cpf) || !isValidEmail(form.email)) {
            toast({
                title: "Dados inválidos",
                description: "Verifique nome, CPF e e-mail.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            const created = await ClientService.create({
                nome: form.nome.trim(),
                cpf: unmaskCpf(form.cpf),
                email: form.email.trim(),
            });
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            onCreated(created);
            toast({ title: "Usuário cadastrado", description: created.nome });
            reset();
            onOpenChange(false);
        } catch (err) {
            const message =
                err instanceof ApiError ? err.message : "Erro ao cadastrar usuário.";
            toast({
                title: "Não foi possível cadastrar",
                description: message,
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    }

    const canSubmit =
        form.nome.trim().length > 0 &&
        isValidCpf(form.cpf) &&
        isValidEmail(form.email) &&
        !submitting;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cadastrar Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="cli-nome">Nome *</Label>
                        <Input
                            id="cli-nome"
                            className="mt-1"
                            placeholder="Nome completo"
                            value={form.nome}
                            onChange={(e) => setForm((v) => ({ ...v, nome: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="cli-cpf">CPF *</Label>
                        <Input
                            id="cli-cpf"
                            className="mt-1"
                            placeholder="000.000.000-00"
                            value={form.cpf}
                            maxLength={14}
                            onChange={(e) => setForm((v) => ({ ...v, cpf: maskCpf(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <Label htmlFor="cli-email">E-mail *</Label>
                        <Input
                            id="cli-email"
                            type="email"
                            className="mt-1"
                            placeholder="email@exemplo.com"
                            value={form.email}
                            onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit} loading={submitting}>
                        Cadastrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
