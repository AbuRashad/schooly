import type { Request, Response } from 'express';
import { getSecret } from '#airo/secrets';

export default async function handler(req: Request, res: Response) {
  try {
    const { subject, grade, topic, duration = 45, lang = 'ar' } = req.body as {
      subject: string;
      grade: string;
      topic: string;
      duration?: number;
      lang?: 'ar' | 'en';
    };

    if (!subject || !grade || !topic) {
      return res.status(400).json({ error: 'subject, grade, topic مطلوبة' });
    }

    const apiKey = getSecret('GEMINI_API_KEY');
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const systemInstruction = lang === 'ar'
      ? `أنت مخطط دروس ذكي لمنصة School Smart Eye. قم بإنشاء خطة درس منظمة بالعربية.`
      : `You are an AI lesson planner for School Smart Eye. Create a well-structured lesson plan in English.`;

    const prompt = lang === 'ar'
      ? `أنشئ خطة درس لمادة "${subject}" للصف "${grade}" عن موضوع "${topic}" لمدة ${duration} دقيقة.

أرجع النتيجة بصيغة JSON فقط بهذا الهيكل:
{
  "title": "عنوان الدرس",
  "objectives": ["هدف 1", "هدف 2"],
  "materials": ["مادة 1", "مادة 2"],
  "timeline": [
    { "phase": "مقدمة", "minutes": 10, "activity": "..." },
    { "phase": "عرض", "minutes": 20, "activity": "..." },
    { "phase": "تطبيق", "minutes": 10, "activity": "..." },
    { "phase": "تقييم", "minutes": 5, "activity": "..." }
  ],
  "homework": "...",
  "notes": "..."
}`
      : `Create a lesson plan for ${subject}, grade ${grade}, topic: "${topic}", duration: ${duration} minutes.

Return ONLY valid JSON with this structure:
{
  "title": "...",
  "objectives": ["..."],
  "materials": ["..."],
  "timeline": [
    { "phase": "...", "minutes": 10, "activity": "..." }
  ],
  "homework": "...",
  "notes": "..."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: 'Gemini API error', details: err });
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

    let lessonPlan;
    try {
      lessonPlan = JSON.parse(jsonStr);
    } catch {
      return res.status(500).json({ error: 'Failed to parse lesson plan', raw: text });
    }

    res.json({ lessonPlan });
  } catch (error) {
    res.status(500).json({ error: 'فشل إنشاء خطة الدرس', message: String(error) });
  }
}
