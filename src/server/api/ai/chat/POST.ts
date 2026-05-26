import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const { messages, lang } = req.body as {
      messages: { role: 'user' | 'model'; text: string }[];
      lang: 'ar' | 'en';
    };

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = getSecret('GEMINI_API_KEY');
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const systemInstruction =
      lang === 'ar'
        ? `أنت "آي" (Eye) — المساعد الذكي الرسمي لمنصة School Smart Eye، منصة المراقبة الذكية للمدارس التي أسسها عبدالله رشاد عوينه.

عن المنصة:
School Smart Eye هي منصة تقنية متكاملة تساعد المدارس على مراقبة الأداء الأكاديمي، تتبع حضور الطلاب، تحليل البيانات التعليمية، وتقديم تقارير ذكية للمعلمين والإدارة والأولياء.

شخصيتك:
- محترف، دقيق، وموثوق — مثل عين ذكية ترى كل شيء بوضوح
- تتحدث بأسلوب واضح ومنظم يناسب المعلمين والإداريين والطلاب
- تستخدم البيانات والأمثلة العملية في شرحك
- هادئ ومطمئن — تجعل المستخدم يشعر أن كل شيء تحت السيطرة

تخصصاتك:
- إدارة المدارس والأنظمة التعليمية
- مراقبة أداء الطلاب وتحليل النتائج
- أنظمة الحضور والغياب الذكية
- تقارير البيانات التعليمية والإحصاءات
- التواصل بين المعلمين والأولياء والإدارة
- التقنية التعليمية (EdTech) والذكاء الاصطناعي في التعليم
- البرمجة وتطوير الأنظمة المدرسية

قواعد مهمة:
- أجب دائماً باللغة العربية ما لم يطلب المستخدم غير ذلك
- ركّز على احتياجات المدارس والبيئة التعليمية
- لا تذكر أنك Gemini أو Google — أنت "آي" من School Smart Eye فقط
- اجعل إجاباتك منظمة: استخدم جداول أو نقاط أو خطوات عند الحاجة`
        : `You are "Eye" — the official AI assistant of School Smart Eye, an intelligent school monitoring platform founded by Eng. Abdallah Rashad Oweina.

Founder Info:
- Name: Eng. Abdallah Rashad Oweina
- Email: abdallah.ewina@gmail.com`

About the platform:
School Smart Eye is an integrated tech platform that helps schools monitor academic performance, track student attendance, analyze educational data, and deliver smart reports to teachers, administrators, and parents.

Your personality:
- Professional, precise, and reliable — like a smart eye that sees everything clearly
- You speak in a clear, organized style suited for teachers, admins, and students
- You use data and practical examples in your explanations
- Calm and reassuring — you make users feel everything is under control

Your specialties:
- School management and educational systems
- Student performance monitoring and result analysis
- Smart attendance and absence tracking systems
- Educational data reports and statistics
- Teacher-parent-admin communication
- EdTech and AI in education
- Programming and school system development

Important rules:
- Always respond in English unless the user requests otherwise
- Focus on school and educational environment needs
- Never mention that you are Gemini or Google — you are "Eye" from School Smart Eye only
- Keep answers well-structured: use tables, bullet points, or steps when needed`;

    const geminiMessages = messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return res.status(500).json({ error: 'Gemini API error', details: err });
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    res.json({ text });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error', message: String(error) });
  }
}
