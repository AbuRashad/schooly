import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import AIAssistantPage from './pages/ai-assistant';
import DashboardPage from './pages/dashboard/index';
import StudentsPage from './pages/dashboard/students';
import AttendancePage from './pages/dashboard/attendance';
import ReportsPage from './pages/dashboard/reports';
import FaceAttendancePage from './pages/dashboard/face-attendance';
import MonitoringPage from './pages/dashboard/monitoring';
import DashboardLoginPage from './pages/dashboard/login';
import DashboardSetupPage from './pages/dashboard/setup';
import ProtectedRoute from './components/dashboard/ProtectedRoute';

const NotFoundPage = lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/ai-assistant', element: <AIAssistantPage /> },
  { path: '/dashboard/login', element: <DashboardLoginPage /> },
  { path: '/dashboard/setup', element: <DashboardSetupPage /> },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/monitoring',
    element: <ProtectedRoute><MonitoringPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/students',
    element: <ProtectedRoute><StudentsPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/attendance',
    element: <ProtectedRoute><AttendancePage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/reports',
    element: <ProtectedRoute><ReportsPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/face-attendance',
    element: <ProtectedRoute><FaceAttendancePage /></ProtectedRoute>,
  },
  { path: '*', element: <NotFoundPage /> },
];

export type Path =
  | '/'
  | '/about'
  | '/contact'
  | '/ai-assistant'
  | '/dashboard'
  | '/dashboard/monitoring'
  | '/dashboard/login'
  | '/dashboard/setup'
  | '/dashboard/students'
  | '/dashboard/attendance'
  | '/dashboard/reports'
  | '/dashboard/face-attendance';

export type Params = Record<string, string | undefined>;
