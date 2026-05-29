import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ClientService } from "@/services/ClientService";
import { ClientCreateDialog } from "@/pages/_shared/components/ClientCreateDialog";
import { useClientsCache } from "../ClientsCacheContext";
import type { EventFormValues } from "../eventFormSchema";
import type { Client, TipoParticipante } from "@/models/Client/Client";

interface ClientPickerProps {
    tipoParticipante: TipoParticipante;
    label: string;
}

const PAGE_SIZE = 10;

function useDebounced<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export function ClientPicker({ tipoParticipante, label }: ClientPickerProps) {
    const { watch, setValue } = useFormContext<EventFormValues>();
    const participantes = watch("participantesEquipe") ?? [];
    const { cacheClient, cacheClients } = useClientsCache();

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [createOpen, setCreateOpen] = useState(false);
    const debouncedSearch = useDebounced(search, 300);

    useEffect(() => {
        setPage(0);
    }, [debouncedSearch]);

    const query = useQuery({
        queryKey: ["clients", debouncedSearch, page] as const,
        queryFn: () =>
            ClientService.list({
                nome: debouncedSearch || undefined,
                page,
                size: PAGE_SIZE,
                sort: "nome,desc",
            }),
        placeholderData: (prev) => prev,
    });

    useEffect(() => {
        if (query.data?.content) cacheClients(query.data.content);
    }, [query.data, cacheClients]);

    const selectedIds = useMemo(
        () =>
            new Set(
                participantes
                    .filter((p) => p.tipoParticipante === tipoParticipante)
                    .map((p) => p.clientId)
            ),
        [participantes, tipoParticipante]
    );

    function toggleClient(client: Client) {
        cacheClient(client);
        const exists = participantes.some(
            (p) => p.clientId === client.id && p.tipoParticipante === tipoParticipante
        );
        if (exists) {
            setValue(
                "participantesEquipe",
                participantes.filter(
                    (p) => !(p.clientId === client.id && p.tipoParticipante === tipoParticipante)
                ),
                { shouldValidate: true }
            );
        } else {
            setValue(
                "participantesEquipe",
                [...participantes, { clientId: client.id, tipoParticipante }],
                { shouldValidate: true }
            );
        }
    }

    function handleCreated(client: Client) {
        cacheClient(client);
        const alreadyIn = participantes.some(
            (p) => p.clientId === client.id && p.tipoParticipante === tipoParticipante
        );
        if (!alreadyIn) {
            setValue(
                "participantesEquipe",
                [...participantes, { clientId: client.id, tipoParticipante }],
                { shouldValidate: true }
            );
        }
    }

    const totalPages = query.data?.totalPages ?? 1;
    const totalElements = query.data?.totalElements ?? 0;
    const items = query.data?.content ?? [];

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground">{label}</h4>
                <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Cadastrar
                </Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border border-border rounded-lg divide-y divide-border min-h-[200px]">
                {query.isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
                )}
                {query.isError && (
                    <p className="text-sm text-destructive text-center py-8">
                        Erro ao carregar clientes. Verifique se o backend está disponível.
                    </p>
                )}
                {!query.isLoading && !query.isError && items.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        Nenhum cliente encontrado.
                    </p>
                )}
                {items.map((client) => {
                    const checked = selectedIds.has(client.id);
                    return (
                        <div
                            key={client.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer"
                            onClick={() => toggleClient(client)}
                        >
                            <Checkbox checked={checked} onCheckedChange={() => toggleClient(client)} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{client.nome}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {client.email} · CPF {client.cpf}
                                </p>
                            </div>
                            {checked && (
                                <Badge variant="secondary" className="text-[10px]">Selecionado</Badge>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {totalElements > 0
                        ? `Página ${page + 1} de ${totalPages} · ${totalElements} cliente(s)`
                        : "—"}
                </span>
                <div className="flex gap-1">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={page === 0 || query.isFetching}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={page >= totalPages - 1 || query.isFetching}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <ClientCreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={handleCreated}
            />
        </div>
    );
}
