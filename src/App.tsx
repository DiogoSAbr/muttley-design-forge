import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import EmitPage from "./pages/EmitPage.tsx";
import HistoryPage from "./pages/HistoryPage.tsx";
import ReceiverProfilePage from "./pages/ReceiverProfilePage.tsx";
import MedalsPage from "./pages/MedalsPage.tsx";
import StudentsPage from "./pages/StudentsPage.tsx";
import TeachersPage from "./pages/TeachersPage.tsx";
import EventsPage from "./pages/EventsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/emit" element={<EmitPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/receivers/:id" element={<ReceiverProfilePage />} />
          <Route path="/receivers" element={<ReceiverProfilePage />} />
          <Route path="/medals" element={<MedalsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/teachers" element={<TeachersPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
