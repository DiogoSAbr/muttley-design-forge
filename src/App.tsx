import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index/Index.tsx";
import LoginPage from "./pages/LoginPage/LoginPage.tsx";
import EmitPage from "./pages/EmitPage/EmitPage.tsx";
import HistoryPage from "./pages/HistoryPage/HistoryPage.tsx";
import ReceiverProfilePage from "./pages/ReceiverProfilePage/ReceiverProfilePage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import MedalsPage from "./pages/MedalsPage/MedalsPage.tsx";
import StudentsPage from "./pages/StudentsPage/StudentsPage.tsx";
import TeachersPage from "./pages/TeachersPage/TeachersPage.tsx";
import EventsLayout from "./pages/EventsPage/EventsLayout.tsx";
import EventsPage from "./pages/EventsPage/EventsPage.tsx";
import EventFormPage from "./pages/EventFormPage/EventFormPage.tsx";
import EventDetailPage from "./pages/EventDetailPage/EventDetailPage.tsx";
import StudentDashboardPage from "./pages/student/StudentDashboardPage/StudentDashboardPage.tsx";
import StudentEventsPage from "./pages/student/StudentEventsPage/StudentEventsPage.tsx";
import StudentMedalsPage from "./pages/student/StudentMedalsPage/StudentMedalsPage.tsx";
import StudentProfilePage from "./pages/student/StudentProfilePage/StudentProfilePage.tsx";

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

            <Route path="/dashboard" element={<Index />} />
            <Route path="/emit" element={<EmitPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/receivers/:id" element={<ReceiverProfilePage />} />
            <Route path="/receivers" element={<ReceiverProfilePage />} />
            <Route path="/medals" element={<MedalsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/teachers" element={<TeachersPage />} />

            <Route element={<EventsLayout />}>
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/new" element={<EventFormPage />} />
              <Route path="/events/:id/edit" element={<EventFormPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
            </Route>

            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/events" element={<StudentEventsPage />} />
            <Route path="/student/medals" element={<StudentMedalsPage />} />
            <Route path="/student/profile" element={<StudentProfilePage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
