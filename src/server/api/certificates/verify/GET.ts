import type { Request, Response } from 'express';
import { db } from '../../../db/client.js';
import { certificates, studentProfiles, schools } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';

export default async function handler(req: Request, res: Response) {
  try {
    const { hash } = req.query as Record<string, string>;

    if (!hash) {
      return res.status(400).json({ error: 'hash مطلوب' });
    }

    const [cert] = await db
      .select({
        id: certificates.id,
        title: certificates.title,
        description: certificates.description,
        type: certificates.type,
        hash: certificates.hash,
        issuedAt: certificates.issuedAt,
        isRevoked: certificates.isRevoked,
        studentName: studentProfiles.fullName,
        schoolName: schools.name,
      })
      .from(certificates)
      .innerJoin(studentProfiles, eq(certificates.studentId, studentProfiles.id))
      .innerJoin(schools, eq(certificates.schoolId, schools.id))
      .where(eq(certificates.hash, hash))
      .limit(1);

    if (!cert) {
      return res.status(404).json({ valid: false, error: 'الشهادة غير موجودة' });
    }

    if (cert.isRevoked) {
      return res.json({ valid: false, error: 'الشهادة ملغاة', certificate: cert });
    }

    res.json({ valid: true, certificate: cert });
  } catch (error) {
    res.status(500).json({ error: 'فشل التحقق', message: String(error) });
  }
}
