import { Outlet } from "react-router-dom";
import { EventsProvider } from "./EventsContext";

export default function EventsLayout() {
    return (
        <EventsProvider>
            <Outlet />
        </EventsProvider>
    );
}
