import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { ClientService } from "@/services/ClientService";
import type { Client, ParticipanteEvento, TipoParticipante } from "@/models/Client/Client";

const PAGE_SIZE = 10;

const TIPO_LABEL: Record<TipoParticipante, string> = {
    ORGANIZADOR: "Organizadores",
    PALESTRANTE: "Palestrantes",
    PATROCINADOR: "Patrocinadores",
};

const TIPOS: TipoParticipante[] = ["ORGANIZADOR", "PALESTRANTE", "PATROCINADOR"];

function useDebounced<T>(value: T, delay = 300) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

interface ParticipantsEditorProps {
    value: ParticipanteEvento[];
    onChange: (next: ParticipanteEvento[]) => void;
    knownNames?: Record<string, string>;
}

interface PickerProps {
    tipoParticipante: TipoParticipante;
    value: ParticipanteEvento[];
    onChange: (next: ParticipanteEvento[]) => void;
    onCacheNames: (clients: Client[]) => void;
}

function Picker({ tipoParticipante, value, onChange, onCacheNames }: PickerProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
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
        if (query.data?.content) onCacheNames(query.data.content);
    }, [query.data, onCacheNames]);

    const selectedIds = useMemo(
        () =>
            new Set(
                value
                    .filter((p) => p.tipoParticipante === tipoParticipante)
                    .map((p) => p.clientId),
            ),
        [value, tipoParticipante],
    );

    function toggleClient(client: Client) {
        onCacheNames([client]);
        const exists = value.some(
            (p) => p.clientId === client.id && p.tipoParticipante === tipoParticipante,
        );
        if (exists) {
            onChange(
                value.filter(
                    (p) => !(p.clientId === client.id && p.tipoParticipante === tipoParticipante),
                ),
            );
        } else {
            onChange([...value, { clientId: client.id, tipoParticipante }]);
        }
    }

    const totalPages = query.data?.totalPages ?? 1;
    const totalElements = query.data?.totalElements ?? 0;
    const items = query.data?.content ?? [];

    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nome..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border border-border rounded-lg divide-y divide-border min-h-[160px]">
                {query.isLoading && (
                    <p className="text-sm text-muted-foreground text-center py-8">Carregando...</p>
                )}
                {query.isError && (
                    <p className="text-sm text-destructive text-center py-8">
                        Erro ao carregar clientes.
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
        </div>
    );
}

export function ParticipantsEditor({ value, onChange, knownNames }: ParticipantsEditorProps) {
    const [nameCache, setNameCache] = useState<Record<string, string>>(knownNames ?? {});

    useEffect(() => {
        if (knownNames) {
            setNameCache((prev) => ({ ...knownNames, ...prev }));
        }
    }, [knownNames]);

    function cacheNames(clients: Client[]) {
        setNameCache((prev) => {
            const next = { ...prev };
            clients.forEach((c) => {
                next[c.id] = c.nome;
            });
            return next;
        });
    }

    function removeAt(clientId: string, tipo: TipoParticipante) {
        onChange(
            value.filter((p) => !(p.clientId === clientId && p.tipoParticipante === tipo)),
        );
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="ORGANIZADOR">
                <TabsList className="w-full">
                    {TIPOS.map((tipo) => {
                        const count = value.filter((p) => p.tipoParticipante === tipo).length;
                        return (
                            <TabsTrigger key={tipo} value={tipo} className="flex-1">
                                {TIPO_LABEL[tipo]}
                                {count > 0 && (
                                    <Badge variant="secondary" className="ml-2 text-[10px]">
                                        {count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>
                {TIPOS.map((tipo) => (
                    <TabsContent key={tipo} value={tipo} className="mt-4">
                        <Picker
                            tipoParticipante={tipo}
                            value={value}
                            onChange={onChange}
                            onCacheNames={cacheNames}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            <div className="grid grid-cols-3 gap-3">
                {TIPOS.map((tipo) => {
                    const items = value.filter((p) => p.tipoParticipante === tipo);
                    return (
                        <div key={tipo} className="bg-muted/40 rounded-lg p-3 min-h-[80px]">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                {TIPO_LABEL[tipo]} ({items.length})
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                                {items.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic">Nenhum</p>
                                )}
                                {items.map((p) => {
                                    const name = nameCache[p.clientId] ?? `#${p.clientId}`;
                                    return (
                                        <div
                                            key={`${tipo}-${p.clientId}`}
                                            className="flex items-center gap-1 text-xs bg-background border border-border rounded px-2 py-1"
                                        >
                                            <span className="flex-1 truncate" title={name}>
                                                {name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeAt(p.clientId, tipo)}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
