import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} School Smart Eye — Eng. <a href="mailto:abdallah.ewina@gmail.com" className="text-primary hover:underline">Abdallah Rashad Oweina</a>. جميع الحقوق محفوظة.
          </div>

          <nav className="flex gap-6">
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              سياسة الخصوصية
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              شروط الاستخدام
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
