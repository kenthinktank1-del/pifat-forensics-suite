import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseList from "./pages/Cases/CaseList";
import CreateCase from "./pages/Cases/CreateCase";
import CaseView from "./pages/Cases/CaseView";
import EvidenceList from "./pages/Evidence/EvidenceList";
import UserList from "./pages/Users/UserList";
import AIAnalyzer from "./pages/AI/Analyzer";
import AcquisitionVisualizer from "./pages/Devices/AcquisitionVisualizer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <SidebarProvider>
                  <div className="flex min-h-screen w-full">
                    <Sidebar />
                    <div className="flex-1 flex flex-col">
                      <Topbar />
                      <main className="flex-1 p-6 bg-background">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/cases" element={<CaseList />} />
                          <Route path="/cases/create" element={<CreateCase />} />
                          <Route path="/cases/:id" element={<CaseView />} />
                          <Route path="/evidence" element={<EvidenceList />} />
                          <Route path="/users" element={<UserList />} />
                          <Route path="/ai/analyzer" element={<AIAnalyzer />} />
                          <Route path="/devices/acquisition" element={<AcquisitionVisualizer />} />
                          <Route path="/notes" element={<div>Notes - Coming Soon</div>} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </SidebarProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
