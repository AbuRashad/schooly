import type { Request, Response } from 'express';

interface TimetableInput {
  sections: { id: number; name: string }[];
  subjects: { id: number; name: string; teacherId: number; weeklyPeriods: number }[];
  rooms: { id: number; name: string }[];
  days: string[];
  periodsPerDay: number;
}

interface Slot {
  day: string;
  period: number;
  sectionId: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
}

export default async function handler(req: Request, res: Response) {
  try {
    const { sections, subjects, rooms, days, periodsPerDay } = req.body as TimetableInput;

    if (!sections?.length || !subjects?.length || !days?.length) {
      return res.status(400).json({ error: 'sections, subjects, days مطلوبة' });
    }

    const slots: Slot[] = [];
    const teacherBusy = new Map<string, boolean>();
    const roomBusy = new Map<string, boolean>();

    function getKey(day: string, period: number, type: 'teacher' | 'room', id: number) {
      return `${day}-${period}-${type}-${id}`;
    }

    for (const section of sections) {
      const sectionSubjects = subjects.filter(s => s.weeklyPeriods > 0);

      for (const subject of sectionSubjects) {
        let periodsNeeded = subject.weeklyPeriods;

        for (const day of days) {
          if (periodsNeeded <= 0) break;

          for (let period = 1; period <= periodsPerDay; period++) {
            if (periodsNeeded <= 0) break;

            const tKey = getKey(day, period, 'teacher', subject.teacherId);
            if (teacherBusy.get(tKey)) continue;

            const room = rooms.find(r => !roomBusy.get(getKey(day, period, 'room', r.id)));
            if (!room) continue;

            const sectionConflict = slots.some(s =>
              s.day === day && s.period === period && s.sectionId === section.id
            );
            if (sectionConflict) continue;

            slots.push({
              day,
              period,
              sectionId: section.id,
              subjectId: subject.id,
              teacherId: subject.teacherId,
              roomId: room.id,
            });

            teacherBusy.set(tKey, true);
            roomBusy.set(getKey(day, period, 'room', room.id), true);
            periodsNeeded--;
          }
        }

        if (periodsNeeded > 0) {
          return res.status(422).json({
            error: `تعذر وضع جميع حصص مادة "${subject.name}" للشعبة "${section.name}"`,
            unscheduled: { sectionId: section.id, subjectId: subject.id, remaining: periodsNeeded },
          });
        }
      }
    }

    res.json({
      success: true,
      slots,
      summary: { totalSlots: slots.length, sections: sections.length, subjects: subjects.length, days: days.length },
    });
  } catch (error) {
    res.status(500).json({ error: 'فشل توليد الجدول', message: String(error) });
  }
}
