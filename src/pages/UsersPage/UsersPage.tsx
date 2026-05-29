import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Search, UserX } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientCreateDialog } from "@/pages/_shared/components/ClientCreateDialog";
import { DataTablePagination } from "@/pages/_shared/components/DataTablePagination";
import { maskCpf } from "@/lib/cpf";
import { useUsersList } from "./hooks/useUsersList";
import { UsersTableHeader } from "./components/UsersTableHeader";

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 8;

const formatDate = (d: string) => {
    if (!d) return "—";
    try {
        return format(parseISO(d), "dd/MM/yyyy", { locale: ptBR });
    } catch {
        return "—";
    }
};

export default function UsersPage() {
    const navigate = useNavigate();
    const {
        data,
        loading,
        error,
        nome,
        sort,
        page,
        size,
        setNome,
        setPage,
        setSort,
        refetch,
    } = useUsersList();

    const [createOpen, setCreateOpen] = useState(false);

    const totalElements = data?.totalElements ?? 0;
    const users = data?.content ?? [];

    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <main className="ml-60 p-8">
                <div className="max-w-5xl mx-auto animate-fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-foreground">Gerenciar usuários</h1>
                            <p className="text-sm text-muted-foreground">
                                {totalElements} usuários cadastrados
                            </p>
                        </div>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Cadastrar Usuário
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Pesquise pelo nome"
                                className="pl-9"
                                value={nome}
                                onChange={e => setNome(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <UsersTableHeader sort={sort} onSortChange={setSort} />
                                <tbody>
                                    {loading &&
                                        Array.from({ length: SKELETON_ROWS }).map((_, idx) => (
                                            <tr key={`skeleton-${idx}`} className="border-b border-border last:border-0">
                                                <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-44" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-12" /></td>
                                                <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                                                <td className="p-3"><Skeleton className="h-8 w-28 mx-auto rounded-md" /></td>
                                            </tr>
                                        ))}

                                    {!loading && error && (
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="p-10">
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <p className="text-sm text-muted-foreground">{error}</p>
                                                    <Button variant="outline" size="sm" onClick={refetch}>
                                                        Tentar novamente
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && !error && users.length === 0 && (
                                        <tr>
                                            <td colSpan={COLUMN_COUNT} className="p-10">
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                                                        <UserX className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Nenhum usuário encontrado.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}

                                    {!loading && !error && users.map(user => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                                        >
                                            <td className="p-3 font-medium text-foreground truncate">{user.nome}</td>
                                            <td className="p-3 text-muted-foreground whitespace-nowrap truncate">
                                                {maskCpf(user.cpf)}
                                            </td>
                                            <td className="p-3 text-muted-foreground truncate">{user.email}</td>
                                            <td className="p-3 text-foreground text-center">{user.totalPontos}</td>
                                            <td className="p-3 text-foreground text-center">{user.totalCertificados}</td>
                                            <td className="p-3 text-foreground text-center">{user.totalMedalhas}</td>
                                            <td className="p-3 text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/users/${user.id}/historico`)}
                                                >
                                                    Ver Histórico
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!loading && !error && data && (
                            <DataTablePagination
                                page={page}
                                size={size}
                                numberOfElements={data.numberOfElements}
                                totalElements={data.totalElements}
                                totalPages={data.totalPages}
                                onPageChange={setPage}
                            />
                        )}
                    </div>
                </div>
            </main>

            <ClientCreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                onCreated={() => refetch()}
            />
        </div>
    );
}
