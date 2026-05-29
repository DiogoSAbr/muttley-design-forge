import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import EventsPage from "./pages/EventsPage/EventsPage.tsx";
import EventFormPage from "./pages/EventFormPage/EventFormPage.tsx";
import EventDetailPage from "./pages/EventDetailPage/EventDetailPage.tsx";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.tsx";
import PresencePage from "./pages/PresencePage/PresencePage.tsx";
import UsersPage from "./pages/UsersPage/UsersPage.tsx";
import UserHistoryPage from "./pages/UserHistoryPage/UserHistoryPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<EventFormPage />} />
            <Route path="/events/:id/edit" element={<EventFormPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />

            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:clientId/historico" element={<UserHistoryPage />} />

            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/presence" element={<PresencePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
