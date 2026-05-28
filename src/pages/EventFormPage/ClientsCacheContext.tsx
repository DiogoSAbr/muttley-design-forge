import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Client } from "@/models/Client/Client";

interface ClientsCacheValue {
    getClient: (id: string) => Client | undefined;
    cacheClient: (client: Client) => void;
    cacheClients: (clients: Client[]) => void;
}

const ClientsCacheContext = createContext<ClientsCacheValue | null>(null);

export function ClientsCacheProvider({ children }: { children: ReactNode }) {
    const [cache, setCache] = useState<Record<string, Client>>({});

    const cacheClient = useCallback((client: Client) => {
        setCache((prev) => ({ ...prev, [client.id]: client }));
    }, []);

    const cacheClients = useCallback((clients: Client[]) => {
        setCache((prev) => {
            const next = { ...prev };
            clients.forEach((c) => {
                next[c.id] = c;
            });
            return next;
        });
    }, []);

    const getClient = useCallback((id: string) => cache[id], [cache]);

    return (
        <ClientsCacheContext.Provider value={{ getClient, cacheClient, cacheClients }}>
            {children}
        </ClientsCacheContext.Provider>
    );
}

export function useClientsCache() {
    const ctx = useContext(ClientsCacheContext);
    if (!ctx) throw new Error("useClientsCache must be used inside ClientsCacheProvider");
    return ctx;
}
