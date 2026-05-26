/**
 * ReportPdfTemplate
 * مكوّن مخصص للطباعة / التصدير PDF — يُعرض داخل div مخفي
 * ويُصدَّر عبر html-to-image + jsPDF أو window.print()
 */

interface StudentRow {
  id: number; name: string; class: string; grade: number;
  attendance: number; status: string; gpa: number;
}
interface AttendanceRow {
  id: number; className: string; date: string;
  total: number; present: number; absent: number; late: number; rate: number;
}
interface StudentSummary {
  total: number; excellent: number; good: number; average: number;
  warning: number; danger: number; avgGrade: number; avgAttend: number; avgGpa: string;
}
interface AttendanceSummary {
  totalRecords: number; totalPresent: number; totalAbsent: number;
  totalLate: number; totalAll: number; overallRate: number;
}

interface Props {
  type: 'students' | 'attendance';
  generatedAt: string;
  filters: Record<string, string>;
  summary: StudentSummary | AttendanceSummary;
  rows: StudentRow[] | AttendanceRow[];
}

const STATUS_AR: Record<string, string> = {
  excellent: 'ممتاز', good: 'جيد', average: 'متوسط', warning: 'تحذير', danger: 'خطر',
};
const STATUS_COLOR: Record<string, string> = {
  excellent: '#16a34a', good: '#0284c7', average: '#d97706', warning: '#ea580c', danger: '#dc2626',
};

export default function ReportPdfTemplate({ type, generatedAt, filters, summary, rows }: Props) {
  const date = new Date(generatedAt).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const isStudents = type === 'students';
  const ss = summary as StudentSummary;
  const as = summary as AttendanceSummary;

  return (
    <div
      id="report-pdf-content"
      dir="rtl"
      style={{
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        background: '#ffffff',
        color: '#1a1a2e',
        padding: '32px 40px',
        minWidth: '900px',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '3px solid #00C2FF', paddingBottom: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '22px' }}>👁️</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0a1e35' }}>School Smart Eye</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>منصة الإدارة المدرسية الذكية</p>
        </div>
        <div style={{ textAlign: 'left' }}>
          <p style={{ fontWeight: 700, fontSize: '16px', color: '#0a1e35', margin: '0 0 4px' }}>
            {isStudents ? 'تقرير بيانات الطلاب' : 'تقرير الحضور والغياب'}
          </p>
          <p style={{ color: '#64748b', fontSize: '11px', margin: 0 }}>تاريخ الإصدار: {date}</p>
          {filters.classFilter && (
            <p style={{ color: '#64748b', fontSize: '11px', margin: '2px 0 0' }}>الصف: {filters.classFilter}</p>
          )}
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isStudents ? 'repeat(5,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
        {isStudents ? (
          <>
            <SummaryCard label="إجمالي الطلاب" value={String(ss.total)} color="#0284c7" />
            <SummaryCard label="متوسط الدرجات" value={`${ss.avgGrade}%`} color="#16a34a" />
            <SummaryCard label="متوسط الحضور" value={`${ss.avgAttend}%`} color="#7c3aed" />
            <SummaryCard label="متوسط GPA" value={ss.avgGpa} color="#d97706" />
            <SummaryCard label="يحتاجون متابعة" value={String(ss.warning + ss.danger)} color="#dc2626" />
          </>
        ) : (
          <>
            <SummaryCard label="إجمالي الطلاب" value={String(as.totalAll)} color="#0284c7" />
            <SummaryCard label="الحاضرون" value={String(as.totalPresent)} color="#16a34a" />
            <SummaryCard label="الغائبون" value={String(as.totalAbsent)} color="#dc2626" />
            <SummaryCard label="نسبة الحضور" value={`${as.overallRate}%`} color="#7c3aed" />
          </>
        )}
      </div>

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ background: '#0a1e35', color: 'white' }}>
            {isStudents ? (
              ['#', 'اسم الطالب', 'الصف', 'الدرجة', 'الحضور', 'الحالة', 'GPA'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
              ))
            ) : (
              ['#', 'الصف', 'التاريخ', 'الإجمالي', 'الحاضرون', 'الغائبون', 'المتأخرون', 'النسبة'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {isStudents
            ? (rows as StudentRow[]).map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '9px 12px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1a1a2e' }}>{s.name}</td>
                <td style={{ padding: '9px 12px', color: '#475569' }}>الصف {s.class}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: s.grade >= 90 ? '#16a34a' : s.grade >= 75 ? '#0284c7' : s.grade >= 60 ? '#d97706' : '#dc2626' }}>
                  {s.grade}%
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '50px', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.attendance}%`, height: '100%', background: s.attendance >= 90 ? '#16a34a' : s.attendance >= 75 ? '#d97706' : '#dc2626', borderRadius: '3px' }} />
                    </div>
                    <span style={{ color: '#475569' }}>{s.attendance}%</span>
                  </div>
                </td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ background: `${STATUS_COLOR[s.status]}18`, color: STATUS_COLOR[s.status], padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    {STATUS_AR[s.status] ?? s.status}
                  </span>
                </td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0284c7' }}>{s.gpa.toFixed(1)}</td>
              </tr>
            ))
            : (rows as AttendanceRow[]).map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '9px 12px', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                <td style={{ padding: '9px 12px', fontWeight: 600, color: '#1a1a2e' }}>الصف {r.className}</td>
                <td style={{ padding: '9px 12px', color: '#475569' }}>{r.date}</td>
                <td style={{ padding: '9px 12px', color: '#475569' }}>{r.total}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#16a34a' }}>{r.present}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#dc2626' }}>{r.absent}</td>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: '#d97706' }}>{r.late}</td>
                <td style={{ padding: '9px 12px' }}>
                  <span style={{ fontWeight: 700, color: r.rate >= 90 ? '#16a34a' : r.rate >= 75 ? '#d97706' : '#dc2626' }}>
                    {r.rate}%
                  </span>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      {/* ── Footer ── */}
      <div style={{ marginTop: '28px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '11px' }}>
        <span>School Smart Eye — منصة الإدارة المدرسية الذكية</span>
        <span>تم إنشاء هذا التقرير تلقائياً بتاريخ {date}</span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: `${color}0f`, border: `1px solid ${color}30`, borderRadius: '10px', padding: '12px 14px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color }}>{value}</p>
    </div>
  );
}
