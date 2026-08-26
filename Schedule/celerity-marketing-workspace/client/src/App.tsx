import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppDataProvider } from "./context/AppDataContext";
import { SearchProvider } from "./context/SearchContext";
import { TaskUIProvider } from "./context/TaskUIContext";
import { ToastProvider } from "./context/ToastContext";
import { I18nProvider } from "./i18n/I18nProvider";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { TasksPage } from "./pages/TasksPage";
import { OtherTasksPage } from "./pages/OtherTasksPage";
import { EvidenciasPage } from "./pages/EvidenciasPage";
import { TeamPage } from "./pages/TeamPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <I18nProvider initialLocale="es">
      <ToastProvider>
        <AppDataProvider>
          <SearchProvider>
            <TaskUIProvider>
              <BrowserRouter>
                <Routes>
                  <Route element={<AppShell />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                    <Route path="/other-tasks" element={<OtherTasksPage />} />
                    <Route path="/evidence" element={<EvidenciasPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </TaskUIProvider>
          </SearchProvider>
        </AppDataProvider>
      </ToastProvider>
    </I18nProvider>
  );
}
