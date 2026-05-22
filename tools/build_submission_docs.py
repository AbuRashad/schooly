from __future__ import annotations

import html
import os
import posixpath
import zipfile
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "patent_submission_package"
OUT.mkdir(exist_ok=True)

NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def esc(text: object) -> str:
    return html.escape(str(text), quote=True)


def rpr(size: int = 24, bold: bool = False, color: str | None = None, font: str = "Arial") -> str:
    color_xml = f'<w:color w:val="{color}"/>' if color else ""
    bold_xml = "<w:b/><w:bCs/>" if bold else ""
    return (
        "<w:rPr>"
        f'<w:rFonts w:ascii="{font}" w:hAnsi="{font}" w:cs="{font}"/>'
        f"<w:sz w:val=\"{size}\"/><w:szCs w:val=\"{size}\"/>"
        f"{bold_xml}{color_xml}"
        "</w:rPr>"
    )


def p(text: str = "", style: str | None = None, align: str = "right", bidi: bool = True,
      size: int = 24, bold: bool = False, color: str | None = None,
      shade: str | None = None, before: int = 0, after: int = 120,
      font: str = "Arial") -> str:
    style_xml = f'<w:pStyle w:val="{style}"/>' if style else ""
    bidi_xml = "<w:bidi/>" if bidi else ""
    shade_xml = f'<w:shd w:fill="{shade}"/>' if shade else ""
    ppr = (
        "<w:pPr>"
        f"{style_xml}<w:jc w:val=\"{align}\"/>{bidi_xml}{shade_xml}"
        f'<w:spacing w:before="{before}" w:after="{after}" w:line="276" w:lineRule="auto"/>'
        "</w:pPr>"
    )
    return f"<w:p>{ppr}<w:r>{rpr(size, bold, color, font)}<w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r></w:p>"


def page_break() -> str:
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def bullet(text: str) -> str:
    return p("• " + text, size=23, after=100)


def table(rows: list[list[str]], widths: list[int], header: bool = True) -> str:
    grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
    xml = [
        '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/>'
        '<w:tblBorders><w:top w:val="single" w:sz="6" w:color="D6DEE8"/>'
        '<w:left w:val="single" w:sz="6" w:color="D6DEE8"/>'
        '<w:bottom w:val="single" w:sz="6" w:color="D6DEE8"/>'
        '<w:right w:val="single" w:sz="6" w:color="D6DEE8"/>'
        '<w:insideH w:val="single" w:sz="4" w:color="E6ECF2"/>'
        '<w:insideV w:val="single" w:sz="4" w:color="E6ECF2"/></w:tblBorders>'
        '<w:jc w:val="right"/></w:tblPr>',
        f"<w:tblGrid>{grid}</w:tblGrid>",
    ]
    for i, row in enumerate(rows):
        fill = "EAF7FF" if header and i == 0 else "FFFFFF"
        txt_color = "0B4F71" if header and i == 0 else "1F2937"
        xml.append("<w:tr>")
        for cell, width in zip(row, widths):
            xml.append(
                "<w:tc><w:tcPr>"
                f'<w:tcW w:w="{width}" w:type="dxa"/>'
                f'<w:shd w:fill="{fill}"/>'
                '<w:tcMar><w:top w:w="120" w:type="dxa"/><w:left w:w="120" w:type="dxa"/>'
                '<w:bottom w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>'
                "</w:tcPr>"
                + p(cell, size=21, bold=(header and i == 0), color=txt_color, after=0)
                + "</w:tc>"
            )
        xml.append("</w:tr>")
    xml.append("</w:tbl>")
    return "".join(xml)


def document_xml(body: str, landscape: bool = False) -> str:
    if landscape:
        pg = '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/>'
    else:
        pg = '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900" w:header="450" w:footer="450" w:gutter="0"/>'
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:document xmlns:w="{NS}"><w:body>{body}'
        f'<w:sectPr>{pg}<w:bidi/></w:sectPr></w:body></w:document>'
    )


def styles_xml() -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:styles xmlns:w="{NS}">'
        '<w:style w:type="paragraph" w:default="1" w:styleId="Normal">'
        '<w:name w:val="Normal"/><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr>'
        '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr>'
        '</w:style>'
        '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/>'
        '<w:pPr><w:bidi/><w:jc w:val="center"/></w:pPr>'
        '<w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/><w:b/><w:bCs/><w:color w:val="0B4F71"/><w:sz w:val="40"/><w:szCs w:val="40"/></w:rPr>'
        '</w:style>'
        '</w:styles>'
    )


def write_docx(path: Path, body: str, landscape: bool = False) -> None:
    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
        '</Types>'
    )
    rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
        '</Relationships>'
    )
    doc_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
        '</Relationships>'
    )
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/_rels/document.xml.rels", doc_rels)
        z.writestr("word/styles.xml", styles_xml())
        z.writestr("word/document.xml", document_xml(body, landscape=landscape))


def manual_body() -> str:
    today = date.today().isoformat()
    parts: list[str] = []
    parts.append(p("Schooly / School Smart Eye", style="Title", size=44, bold=True, color="0B4F71", after=180))
    parts.append(p("كتاب شرح تفصيلي ملون لإمكانيات منصة المراقبة المدرسية الذكية", align="center", size=28, bold=True, color="0F766E", after=220))
    parts.append(table([
        ["البند", "البيان"],
        ["اسم البرنامج", "Schooly - School Smart Eye"],
        ["نوع المصنف", "منصة ويب مدرسية مدعومة بالذكاء الاصطناعي وإدارة الحضور والسلامة"],
        ["لغة البرمجة", "TypeScript / React / Vite / Node.js API / Drizzle ORM / MySQL، مع وحدات Python مساعدة"],
        ["بيئة التشغيل", "متصفح ويب حديث، Node.js 22 أو أحدث، قاعدة بيانات MySQL، ودعم Docker عند النشر"],
        ["تاريخ إعداد الملف", today],
    ], [2300, 7060]))
    parts.append(page_break())
    parts.append(p("1. الملخص التنفيذي", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    parts.append(p("منصة Schooly هي نظام رقمي لإدارة ومراقبة البيئة المدرسية عبر لوحة تحكم عربية، يجمع بين إدارة الطلاب، الحضور اليومي، الحضور الذكي بالتعرف على الوجه، التقارير، المراقبة الحية، ومساعد ذكاء اصطناعي. صممت المنصة لتجميع البيانات التعليمية والتشغيلية في واجهة واحدة تساعد الإدارة على اتخاذ قرارات أسرع وأكثر دقة."))
    parts.append(p("2. القيمة الابتكارية", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    for item in [
        "دمج بيانات الحضور والسلوك والتنبيهات داخل مؤشر سلامة مدرسي موحد SSI.",
        "استخدام التعرف على الوجه لتسجيل حضور الطالب وتقليل التدخل اليدوي.",
        "لوحة تحكم عربية فورية تعرض مؤشرات الأداء والتنبيهات والرسوم المصغرة.",
        "هيكل بيانات مدرسي شامل يغطي المدارس، الفروع، السنوات الدراسية، الصفوف، المواد، المعلمين، الطلاب، أولياء الأمور، التقييمات، الواجبات، والإعلانات.",
        "طبقة واجهات API قابلة للتوسع للفصل بين واجهة المستخدم وقاعدة البيانات والمنطق التشغيلي.",
    ]:
        parts.append(bullet(item))
    parts.append(p("3. الشاشات الرئيسية", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    parts.append(table([
        ["الشاشة", "المسار", "الوظيفة"],
        ["الصفحة الرئيسية", "/", "تعرض تعريف المنصة، المميزات، الإحصاءات، والوحدات التقنية."],
        ["تسجيل الدخول", "/dashboard/login", "دخول آمن للوحة التحكم وربط المستخدم بجلسة مصادقة."],
        ["لوحة التحكم", "/dashboard", "مؤشرات الطلاب والمعلمين والفصول والحضور والتنبيهات والرسوم البيانية."],
        ["إدارة الطلاب", "/dashboard/students", "بحث، فلترة، إضافة، تعديل، وحذف بيانات الطلاب مع مؤشرات الأداء."],
        ["الحضور اليومي", "/dashboard/attendance", "ملخص حضور وغياب وتأخير لكل صف ونسبة الحضور الإجمالية."],
        ["التقارير", "/dashboard/reports", "تقارير تشغيلية قابلة للتوليد والطباعة عن الطلاب والحضور والأداء."],
        ["الحضور الذكي", "/dashboard/face-attendance", "تسجيل وجه الطالب ومسح الحضور بالكاميرا وتسجيل الثقة والوقت."],
        ["المراقبة", "/dashboard/monitoring", "متابعة بيانات السلامة والتنبيهات ومؤشرات المراقبة."],
        ["المساعد الذكي", "/ai-assistant", "واجهة محادثة للمساعدة في تحليل الأسئلة والبيانات التعليمية."],
    ], [2200, 1900, 5260]))
    parts.append(p("4. إمكانيات المنصة تفصيليا", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    sections = [
        ("إدارة الطلاب", ["تخزين بيانات الطالب الأساسية، الصف، الدرجة، نسبة الحضور، الحالة، والمعدل.", "البحث والفلترة حسب الاسم أو الصف أو الحالة.", "واجهات إضافة وتعديل وحذف متصلة بواجهات API."]),
        ("الحضور التقليدي", ["عرض إجمالي الطلاب والحاضرين والغائبين والمتأخرين.", "حساب نسبة حضور إجمالية لليوم.", "جدول تفصيلي لكل صف مع ألوان دلالية حسب نسبة الحضور."]),
        ("الحضور بالتعرف على الوجه", ["التقاط صورة الطالب وتخزين descriptor رقمي للوجه.", "مطابقة الوجوه أثناء المسح وتسجيل الحضور فوريا.", "تسجيل الوقت ونسبة الثقة ومنع التكرار اليومي."]),
        ("التقارير", ["توليد تقارير تشغيلية وإدارية.", "قالب PDF مخصص للتقارير.", "إمكانية عرض وتحليل بيانات الطلاب والحضور والأداء."]),
        ("المراقبة والسلامة", ["قراءة بيانات مباشرة عبر hooks مخصصة.", "مؤشرات تنبيه وحالات خطورة.", "تصميم قابل لدمج كاميرات RTSP ووحدات ذكاء اصطناعي متعددة."]),
        ("المصادقة والصلاحيات", ["نظام BetterAuth للجلسات والحسابات.", "ProtectedRoute لحماية صفحات لوحة التحكم.", "تسجيل خروج آمن من الشريط الجانبي."]),
        ("قاعدة البيانات", ["جداول مدرسية وأكاديمية شاملة.", "فهارس وقيود unique لضمان جودة البيانات.", "نماذج face_descriptors وface_attendance_logs للحضور الذكي."]),
        ("البنية التقنية", ["React 19 وTypeScript وVite.", "Tailwind CSS ومكونات UI قابلة لإعادة الاستخدام.", "Drizzle ORM وMySQL وواجهات API داخل src/server/api."]),
    ]
    for title, items in sections:
        parts.append(p(title, size=27, bold=True, color="0F766E", before=120, after=80))
        for item in items:
            parts.append(bullet(item))
    parts.append(p("5. الوحدات التقنية المقترحة داخل المنصة", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    units = [
        ["01", "التقاط الفيديو", "ربط كاميرات المدرسة وبث البيانات إلى طبقة التحليل."],
        ["02", "فهم المشهد", "تمييز الحالة العامة للمكان واتجاه الحركة."],
        ["03", "تتبع المسارات", "تتبع حركة الطلاب داخل مناطق المدرسة."],
        ["04", "كشف المخاطر", "رصد الحالات غير الطبيعية والتنبيه المبكر."],
        ["05", "الذاكرة الفضائية", "ربط الأحداث بمواقعها داخل المدرسة."],
        ["06", "التماسك الجماعي", "تحليل الكثافة والتجمعات."],
        ["07", "التنبؤ بالكثافة", "توقع الزحام قبل حدوثه."],
        ["08", "الحضور والسلامة", "دمج الحضور مع مؤشرات السلامة."],
        ["09", "التنبيه والاستجابة", "إصدار تنبيهات فورية للإدارة."],
        ["10", "لوحة التحكم", "تجميع المؤشرات في واجهة واحدة."],
        ["11", "التقارير الدورية", "إخراج تقارير تشغيلية وإشرافية."],
        ["12", "بوابة الأولياء", "عرض آمن لبيانات الطالب لولي الأمر."],
        ["13", "التقييم الذاتي", "مراجعة مؤشرات المدرسة وتحسين الأداء."],
        ["14", "حوكمة البيانات", "إدارة الخصوصية والسجلات والصلاحيات."],
        ["15", "الذكاء التربوي", "تحليل الأداء الدراسي ودعم القرار."],
    ]
    parts.append(table([["رقم", "الوحدة", "الوصف"]] + units, [900, 2500, 5960]))
    parts.append(p("6. طريقة التشغيل والاستخدام", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    for step in [
        "تجهيز ملف البيئة .env من env.example وتحديد بيانات قاعدة البيانات.",
        "تشغيل قاعدة البيانات MySQL أو Docker compose حسب بيئة النشر.",
        "تشغيل npm run dev للتطوير أو npm run build ثم npm run preview للمعاينة الإنتاجية.",
        "الدخول إلى /dashboard/login ثم الانتقال إلى لوحة التحكم.",
        "إضافة الطلاب أو استيرادهم، ثم استخدام الحضور اليومي أو الحضور الذكي.",
        "متابعة التقارير والتنبيهات من شاشة التقارير والمراقبة.",
    ]:
        parts.append(bullet(step))
    parts.append(p("7. ملف الإيداع المقترح حسب الورقة المرفقة", size=32, bold=True, color="0B4F71", shade="EAF7FF"))
    parts.append(table([
        ["م", "المطلوب", "الحالة في هذه الحزمة"],
        ["1", "عدد 2 نسخة من المصنف على flash memory ومعها الشاشات والمستندات", "انسخ مجلد المشروع + هذه المستندات على عدد 2 فلاشة."],
        ["2", "طباعة أول وآخر 20 صفحة من كود البرمجة أو 10% من source code", "تم إعداد ملف Word منفصل باسم Schooly_Source_Code_First_20_Last_20_Pages.docx."],
        ["3", "طباعة شاشات البرنامج الرئيسية", "يمكن طباعة صفحات الكتاب التي تصف الشاشات، ويفضل إضافة Screenshots فعلية من المتصفح عند الطباعة النهائية."],
        ["4", "وصف البرنامج ووظائفه وكيفية استخدامه ولغة البرمجة ونظم تشغيله", "موجود بالكامل في هذا الكتاب."],
        ["5", "عقود تراخيص الاستغلال المالي للغير عند نقل الحقوق", "يضاف فقط إن وجد تنازل أو ترخيص للغير."],
        ["6", "إثبات شخصية المؤلف", "يضاف من مقدم الطلب."],
        ["7", "إثبات شخصية مقدم الطلب", "يضاف من مقدم الطلب أو الوكيل."],
        ["8", "مستندات الشركة إن كان المؤلف شخصا معنويا", "تضاف عند التقديم باسم شركة."],
        ["9", "إحضار مهندس مصمم البرنامج مع اللابتوب واللغة والأكواد", "يوصى بإحضار الجهاز وفيه المشروع يعمل محليا."],
        ["10", "رسوم الإيداع", "حسب ما يطلبه المكتب وقت التقديم."],
    ], [650, 4300, 4410]))
    parts.append(p("تنبيه", size=26, bold=True, color="B45309", shade="FFF7ED"))
    parts.append(p("هذا المستند تجهيز فني وتنظيمي للتقديم ولا يغني عن مراجعة موظف الإيداع أو محام متخصص في الملكية الفكرية عند الحاجة، خصوصا إذا كان المطلوب براءة اختراع بالمعنى القانوني لا إيداع برنامج كمبيوتر كمصنف."))
    return "".join(parts)


def source_files() -> list[Path]:
    exts = {".ts", ".tsx", ".js", ".jsx", ".py", ".css", ".html", ".json", ".md", ".yml", ".yaml", ".config"}
    skip_dirs = {"node_modules", "dist", ".git", ".venv", ".local", ".claude", "__pycache__", "patent_submission_package"}
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel_parts = set(path.relative_to(ROOT).parts)
        if rel_parts & skip_dirs:
            continue
        if path.suffix.lower() in exts or path.name in {"Dockerfile.backend", "Dockerfile.frontend", ".npmrc"}:
            files.append(path)
    return sorted(files, key=lambda pth: posixpath.join(*pth.relative_to(ROOT).parts).lower())


def collect_source_lines() -> list[tuple[str, int, str]]:
    lines: list[tuple[str, int, str]] = []
    for file in source_files():
        rel = posixpath.join(*file.relative_to(ROOT).parts)
        try:
            text = file.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            text = file.read_text(encoding="utf-8", errors="replace")
        lines.append((rel, 0, f"// ===== FILE: {rel} ====="))
        for n, line in enumerate(text.splitlines(), 1):
            lines.append((rel, n, line))
    return lines


def code_doc_body() -> str:
    all_lines = collect_source_lines()
    lines_per_page = 48
    required_pages_each_side = 20
    chunk = required_pages_each_side * lines_per_page
    first = all_lines[:chunk]
    last = all_lines[-chunk:] if len(all_lines) > chunk else []
    selected = [("FIRST", first), ("LAST", last)]

    body: list[str] = []
    body.append(p("Schooly Source Code Printout", style="Title", size=36, bold=True, color="0B4F71", after=120))
    body.append(p("أول 20 صفحة وآخر 20 صفحة من كود المصدر، محسوبة على 48 سطر لكل صفحة كود.", align="center", size=22, bold=True, color="0F766E"))
    body.append(table([
        ["البند", "القيمة"],
        ["إجمالي أسطر المصدر المجمعة", str(len(all_lines))],
        ["عدد الصفحات المطلوبة", "40 صفحة كود: 20 من البداية + 20 من النهاية"],
        ["طريقة الاختيار", "ترتيب ملفات المشروع أبجديا مع استبعاد node_modules و dist وملفات cache"],
        ["ملاحظة", "الكود أدناه من ملفات المشروع مباشرة دون إعادة صياغة."],
    ], [3000, 6360]))
    body.append(page_break())
    page_no = 1
    for label, group in selected:
        if not group:
            continue
        title = "أول 20 صفحة من الكود" if label == "FIRST" else "آخر 20 صفحة من الكود"
        body.append(p(title, size=26, bold=True, color="0B4F71", shade="EAF7FF", after=80))
        for i in range(0, len(group), lines_per_page):
            page = group[i:i + lines_per_page]
            if not page:
                continue
            body.append(p(f"صفحة كود {page_no:02d} من 40", size=18, bold=True, color="0F766E", after=40))
            for rel, n, line in page:
                prefix = "      " if n == 0 else f"{n:05d} "
                safe_line = (prefix + line).replace("\t", "    ")
                body.append(p(safe_line[:210], align="left", bidi=False, size=14, after=0, font="Consolas"))
            page_no += 1
            if page_no <= 40:
                body.append(page_break())
    return "".join(body)


def checklist_body() -> str:
    parts: list[str] = []
    parts.append(p("ملف تجهيز تقديم برنامج Schooly", style="Title", size=38, bold=True, color="0B4F71"))
    parts.append(p("قائمة تسليم مختصرة حسب المتطلبات الظاهرة في المرفق", align="center", size=24, bold=True, color="0F766E"))
    parts.append(table([
        ["جاهز", "المرفق/الإجراء", "ملاحظات قبل الذهاب"],
        ["☐", "عدد 2 فلاشة تحتوي نسخة كاملة من المشروع", "انسخ مجلد schooly بالكامل ومعه مجلد patent_submission_package."],
        ["☐", "مستند شرح البرنامج ووظائفه", "Schooly_Platform_Manual.docx"],
        ["☐", "مستند الكود المطلوب", "Schooly_Source_Code_First_20_Last_20_Pages.docx"],
        ["☐", "طباعة الشاشات الرئيسية", "افتح localhost واطبع الصفحة الرئيسية ولوحة التحكم والطلاب والحضور والتقارير والحضور الذكي."],
        ["☐", "صورة بطاقة المؤلف", "يجهزها صاحب الطلب."],
        ["☐", "صورة بطاقة مقدم الطلب/المودع", "يجهزها صاحب الطلب أو الوكيل."],
        ["☐", "سجل/بطاقة ضريبية/ترخيص مزاولة إن كان باسم شركة", "للشخص المعنوي فقط."],
        ["☐", "عقود تنازل أو تراخيص استغلال مالي", "إن وجدت فقط."],
        ["☐", "اللابتوب وعليه المشروع يعمل", "يفضل فتح المشروع قبل الموعد والتأكد أن npm run dev يعمل."],
        ["☐", "رسوم الإيداع", "حسب المطلوب في المكتب وقت التقديم."],
    ], [900, 3900, 4560]))
    parts.append(p("بيان فني مختصر", size=30, bold=True, color="0B4F71", shade="EAF7FF"))
    parts.append(p("Schooly منصة ويب مدرسية لإدارة الطلاب والحضور والتقارير والمراقبة والحضور الذكي بالتعرف على الوجه، مطورة باستخدام React وTypeScript وVite وNode.js API وDrizzle ORM وقاعدة بيانات MySQL، وتعمل عبر متصفح ويب حديث على بيئة Node.js 22 أو أحدث."))
    return "".join(parts)


def main() -> None:
    write_docx(OUT / "Schooly_Platform_Manual.docx", manual_body())
    write_docx(OUT / "Schooly_Source_Code_First_20_Last_20_Pages.docx", code_doc_body(), landscape=True)
    write_docx(OUT / "Schooly_Submission_Checklist.docx", checklist_body())
    print(OUT)
    for path in sorted(OUT.glob("*.docx")):
        print(path.name, path.stat().st_size)


if __name__ == "__main__":
    main()
