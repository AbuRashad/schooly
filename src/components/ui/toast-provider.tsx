import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from '@/components/ThemeProvider';

export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      position="top-left"
      dir="rtl"
      richColors
      closeButton
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          borderRadius: '14px',
          direction: 'rtl',
        },
      }}
      theme={resolvedTheme}
    />
  );
}

export { toast } from 'sonner';
