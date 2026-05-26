const BOOT_RETRY_DELAY_MS = 1500;

function renderStartupError(error: unknown) {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <main style="min-height:100vh;display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;">
      <div style="max-width:640px;width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:20px;">
        <h1 style="margin:0 0 12px;font-size:24px;">Failed to start Schooly</h1>
        <p style="margin:0 0 8px;color:#4b5563;">The app could not load its startup bundle.</p>
        <p style="margin:0;color:#4b5563;">Please refresh the page or restart the development server.</p>
      </div>
    </main>
  `;

  console.error('Schooly startup error:', error);
}

async function boot(attempt = 0): Promise<void> {
  try {
    await import('./main');
  } catch (error) {
    if (attempt === 0) {
      window.setTimeout(() => {
        void boot(1);
      }, BOOT_RETRY_DELAY_MS);
      return;
    }

    renderStartupError(error);
  }
}

void boot();
