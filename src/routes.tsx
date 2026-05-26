import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import ContactPage from './pages/contact';
import AIAssistantPage from './pages/ai-assistant';
import DashboardPage from './pages/dashboard/index';
import StudentsPage from './pages/dashboard/students';
import StudentDetailPage from './pages/dashboard/student-detail';
import AttendancePage from './pages/dashboard/attendance';
import ReportsPage from './pages/dashboard/reports';
import FaceAttendancePage from './pages/dashboard/face-attendance';
import MonitoringPage from './pages/dashboard/monitoring';
import DashboardLoginPage from './pages/dashboard/login';
import DashboardSetupPage from './pages/dashboard/setup';
import ProtectedRoute from './components/dashboard/ProtectedRoute';

// New feature pages (lazy-loaded)
const LessonPlannerPage = lazy(() => import('./pages/dashboard/lesson-planner'));
const TimetablePage = lazy(() => import('./pages/dashboard/timetable'));
const MoodPage = lazy(() => import('./pages/dashboard/mood'));
const PeerReviewPage = lazy(() => import('./pages/dashboard/peer-review'));
const InventoryPage = lazy(() => import('./pages/dashboard/inventory'));
const VerifyCertificatePage = lazy(() => import('./pages/verify-certificate'));
const CampusMapPage = lazy(() => import('./pages/campus-map'));
const ParentPortalPage = lazy(() => import('./pages/parent/index'));

const NotFoundPage = lazy(() => import('./pages/_404'));

export const routes: RouteObject[] = [
  // Public website
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/ai-assistant', element: <AIAssistantPage /> },

  // Public services
  { path: '/verify-certificate', element: <VerifyCertificatePage /> },
  { path: '/campus-map', element: <CampusMapPage /> },

  // Parent portal
  { path: '/parent/dashboard', element: <ParentPortalPage /> },

  // Dashboard auth
  { path: '/dashboard/login', element: <DashboardLoginPage /> },
  { path: '/dashboard/setup', element: <DashboardSetupPage /> },

  // Dashboard pages (protected)
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
    path: '/dashboard/students/:id',
    element: <ProtectedRoute><StudentDetailPage /></ProtectedRoute>,
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

  // New 11-feature pages
  {
    path: '/dashboard/lesson-planner',
    element: <ProtectedRoute><LessonPlannerPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/timetable',
    element: <ProtectedRoute><TimetablePage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/mood',
    element: <ProtectedRoute><MoodPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/peer-review',
    element: <ProtectedRoute><PeerReviewPage /></ProtectedRoute>,
  },
  {
    path: '/dashboard/inventory',
    element: <ProtectedRoute><InventoryPage /></ProtectedRoute>,
  },

  { path: '*', element: <NotFoundPage /> },
];

export type Path =
  | '/'
  | '/about'
  | '/contact'
  | '/ai-assistant'
  | '/verify-certificate'
  | '/campus-map'
  | '/parent/dashboard'
  | '/dashboard'
  | '/dashboard/monitoring'
  | '/dashboard/login'
  | '/dashboard/setup'
  | '/dashboard/students'
  | '/dashboard/students/:id'
  | '/dashboard/attendance'
  | '/dashboard/reports'
  | '/dashboard/face-attendance'
  | '/dashboard/lesson-planner'
  | '/dashboard/timetable'
  | '/dashboard/mood'
  | '/dashboard/peer-review'
  | '/dashboard/inventory';

export type Params = Record<string, string | undefined>;
