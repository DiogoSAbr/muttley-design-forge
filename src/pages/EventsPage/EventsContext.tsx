import { createContext, useContext, useState } from "react";
import type { EventItem } from "@/models/Event/Event";
import eventData from "@/mock/Event.json";

const initialEvents: EventItem[] = eventData.mockEvents as EventItem[];

interface EventsContextType {
    events: EventItem[];
    addEvent: (event: EventItem) => void;
    updateEvent: (event: EventItem) => void;
    deleteEvent: (id: string) => void;
    cancelEvent: (id: string) => void;
}

const EventsContext = createContext<EventsContextType | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<EventItem[]>(initialEvents);

    const addEvent = (event: EventItem) => setEvents(prev => [event, ...prev]);
    const updateEvent = (event: EventItem) => setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));
    const cancelEvent = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "cancelado" as const } : e));

    return (
        <EventsContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, cancelEvent }}>
            {children}
        </EventsContext.Provider>
    );
}

export function useEvents() {
    const ctx = useContext(EventsContext);
    if (!ctx) throw new Error("useEvents must be used within EventsProvider");
    return ctx;
}
