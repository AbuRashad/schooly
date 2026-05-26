import { Suspense } from 'react';
import { createBrowserRouter, isRouteErrorResponse, Outlet, RouterProvider, useRouteError } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Spinner from './components/Spinner';
import { ToastProvider } from './components/ui/toast-provider';
import { routes } from './routes';

const SpinnerFallback = () => (
  <div className="flex justify-center py-8 h-screen items-center">
    <Spinner />
  </div>
);

function RouterErrorFallback() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : 'Unexpected application error';
  const description = isRouteErrorResponse(error) ? error.data : 'Please refresh the page and try again.';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" role="alert">
      <div className="max-w-xl w-full border rounded-xl p-6 bg-card">
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-4">{String(description)}</p>
        <a href="/" className="underline text-primary">Back to home</a>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<SpinnerFallback />}>
        <RootLayout>
          <Outlet />
        </RootLayout>
      </Suspense>
    ),
    children: routes,
    errorElement: <RouterErrorFallback />,
  },
]);

export default function App() {
  return (
    <>
      <ToastProvider />
      <RouterProvider router={router} />
    </>
  );
}
