import type { ReactNode } from "react";

export function PublicLayout({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md flex flex-col items-center animate-fade-in">
                <img
                    src="/FATEC_ZONA_LESTE_LOGO.png"
                    alt="Fatec Zona Leste"
                    className="h-16 w-auto mb-4"
                />
                <h1 className="text-xl font-semibold text-foreground mb-6 text-center">
                    {title}
                </h1>
                {children}
            </div>
        </div>
    );
}
