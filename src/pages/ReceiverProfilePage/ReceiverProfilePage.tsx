import { AppSidebar } from "@/components/AppSidebar";
import { UserAvatar } from "@/components/UserAvatar";
import { MedalCard } from "@/components/MedalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Linkedin, ExternalLink } from "lucide-react";
import type { Receiver } from "@/models/Receiver/Receiver";
import receiverData from "@/mock/Receiver.json";

const receiver: Receiver = receiverData.mockReceivers[0] as Receiver;

export default function ReceiverProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60 p-8">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <div className="bg-card border border-border rounded-xl p-6 mb-6 shadow-card">
            <div className="flex items-start gap-5">
              <UserAvatar name={receiver.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-card-foreground">{receiver.name}</h1>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono">ID: {receiver.id}</p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {receiver.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {receiver.phone}
                  </span>
                </div>

                <div className="mt-3">
                  <Button variant="linkedin" size="sm">
                    <Linkedin className="w-3.5 h-3.5" />
                    Ver perfil LinkedIn
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-medium text-foreground">Medalhas</h2>
                <StatusBadge variant="neutral" size="sm">{receiver.medals.length}</StatusBadge>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-8 px-2 rounded-md border border-input bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                  <option>Todas as categorias</option>
                  <option>Tecnologia</option>
                  <option>Liderança</option>
                  <option>Comunicação</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {receiver.medals.map((medal, idx) => (
                <MedalCard
                  key={idx}
                  name={medal.name}
                  issuer={medal.issuer}
                  date={medal.date}
                  category={medal.category}
                  linkedInStatus={medal.linkedInStatus}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
