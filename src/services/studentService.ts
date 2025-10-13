declare global {
  interface Window {
    //eslint-disable-next-line
    students?: any[];
  }
}

export async function fetchStudents() {
  const userId = localStorage.getItem("userId"); // Session data - Keep for authentication
  const res = await fetch(`/api/students?userId=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch students");
  const data = await res.json();
  // تبدیل _id به mongoId
  //eslint-disable-next-line
  return data.map((student: any) => ({
    ...student,
    mongoId: student._id,
  }));
}

//eslint-disable-next-line
export async function addStudentToDB(studentData: any) {
  const userId = localStorage.getItem("userId"); // Session data - Keep for authentication
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...studentData, userId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

//eslint-disable-next-line
export async function editStudentInDB(mongoId: string, studentData: any) {
  const userId = localStorage.getItem("userId"); // Session data - Keep for authentication

  // دریافت دانش‌آموز فعلی از store برای حفظ sessions
  const { useStudentStore } = await import("../store/studentStore");
  const currentStudent = useStudentStore
    .getState()
    .students.find((s) => s.mongoId === mongoId || s.id === mongoId);

  let sessionsToKeep = currentStudent?.sessions ?? [];

  // بررسی تغییرات مهم که نیاز به بروزرسانی sessions دارند
  let shouldRegenerateSessions = false;

  // بررسی تغییر تاریخ جلسات
  if (studentData.firstSessionDates && currentStudent?.firstSessionDates) {
    const oldDateTimestamps = currentStudent.firstSessionDates
      .map((d: Date) => new Date(d).getTime())
      .sort()
      .join(",");
    const newDateTimestamps = studentData.firstSessionDates
      .map((d: Date) => new Date(d).getTime())
      .sort()
      .join(",");

    if (oldDateTimestamps !== newDateTimestamps) {
      shouldRegenerateSessions = true;
    }
  }

  // بررسی تغییر مبلغ واریزی یا قیمت جلسه
  const oldDepositAmount = currentStudent?.depositAmount || 0;
  const newDepositAmount = studentData.depositAmount || 0;
  const oldPrice = parseFloat(currentStudent?.price || "0");
  const newPrice = parseFloat(studentData.price || "0");

  // بررسی تغییر زمان‌های کلاس
  const oldStartTime = currentStudent?.startTime || "";
  const newStartTime = studentData.startTime || "";
  const oldEndTime = currentStudent?.endTime || "";
  const newEndTime = studentData.endTime || "";

  // بررسی تغییر مدت زمان کلاس
  const oldDuration = currentStudent?.duration || 0;
  const newDuration = studentData.duration || 0;

  // بررسی تغییر تنظیمات روزهای کلاس
  const oldMultiDay = currentStudent?.multiDay || false;
  const newMultiDay = studentData.multiDay || false;
  const oldDaysPerWeek = currentStudent?.daysPerWeek || 1;
  const newDaysPerWeek = studentData.daysPerWeek || 1;

  console.log("Days comparison:", {
    oldMultiDay,
    newMultiDay,
    oldDaysPerWeek,
    newDaysPerWeek,
    multiDayChanged: oldMultiDay !== newMultiDay,
    daysPerWeekChanged: oldDaysPerWeek !== newDaysPerWeek,
  });

  if (
    oldDepositAmount !== newDepositAmount ||
    oldPrice !== newPrice ||
    oldStartTime !== newStartTime ||
    oldEndTime !== newEndTime ||
    oldDuration !== newDuration ||
    oldMultiDay !== newMultiDay ||
    oldDaysPerWeek !== newDaysPerWeek
  ) {
    shouldRegenerateSessions = true;
    console.log("Session parameters changed:", {
      depositAmount: { old: oldDepositAmount, new: newDepositAmount },
      price: { old: oldPrice, new: newPrice },
      startTime: { old: oldStartTime, new: newStartTime },
      endTime: { old: oldEndTime, new: newEndTime },
      duration: { old: oldDuration, new: newDuration },
      multiDay: { old: oldMultiDay, new: newMultiDay },
      daysPerWeek: { old: oldDaysPerWeek, new: newDaysPerWeek },
    });
  }

  if (shouldRegenerateSessions) {
    console.log("Regenerating sessions...");
    const { addWeeks } = await import("date-fns");

    // محاسبه جلسات پرداخت شده بر اساس مبلغ واریزی
    const sessionPrice = parseFloat(studentData.price) || 0;
    const depositAmount = studentData.depositAmount || 0;
    const totalPaidSessions =
      sessionPrice > 0 ? Math.floor(depositAmount / sessionPrice) : 0;

    // منطق ماهانه: تولید جدول بر اساس ماه‌های کامل (هر ماه = 4 جلسه)
    const monthsNeeded = Math.ceil(totalPaidSessions / 4);
    const totalSessionsToGenerate = monthsNeeded * 4;

    //eslint-disable-next-line
    const newSessions: any[] = [];
    const sessionDates =
      studentData.firstSessionDates || currentStudent?.firstSessionDates || [];

    console.log("Session generation details:", {
      sessionPrice,
      depositAmount,
      totalPaidSessions,
      monthsNeeded,
      totalSessionsToGenerate,
      sessionDatesCount: sessionDates.length,
      daysPerWeek: studentData.daysPerWeek,
    });

    // محدود کردن تعداد تاریخ‌ها بر اساس daysPerWeek
    const limitedSessionDates = sessionDates.slice(
      0,
      studentData.daysPerWeek || 1
    );
    const daysPerWeek = limitedSessionDates.length;

    console.log("Updated logic:", {
      totalPaidSessions,
      totalSessionsToGenerate,
      daysPerWeek,
      limitedSessionDatesCount: limitedSessionDates.length,
    });

    // منطق جدید: توزیع sessions بر اساس تعداد جلسات پرداخت شده
    let sessionCounter = 0;
    let weekCounter = 0;

    // ادامه تولید تا زمانی که تمام sessions مورد نیاز تولید شوند
    while (sessionCounter < totalSessionsToGenerate) {
      // برای هر روز از روزهای هفته
      for (
        let dayIndex = 0;
        dayIndex < daysPerWeek && sessionCounter < totalSessionsToGenerate;
        dayIndex++
      ) {
        const baseDate = new Date(limitedSessionDates[dayIndex]);
        const sessionDate = addWeeks(baseDate, weekCounter);
        const isPaid = sessionCounter < totalPaidSessions;

        newSessions.push({
          id: `${Date.now()}_${Math.random()}_${sessionCounter}`,
          date: sessionDate,
          startTime: studentData.startTime,
          endTime: studentData.endTime,
          attended: false,
          absent: false,
          price: studentData.price,
          deposit: isPaid,
          paid: isPaid,
        });

        sessionCounter++;
      }
      weekCounter++;
    }

    console.log("Final session generation result:", {
      totalSessionsGenerated: newSessions.length,
      paidSessions: newSessions.filter((s) => s.paid).length,
      unpaidSessions: newSessions.filter((s) => !s.paid).length,
    });

    sessionsToKeep = newSessions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  const dataToUpdate = {
    ...studentData,
    userId,
    sessions: sessionsToKeep,
  };

  const res = await fetch("/api/students", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId, data: dataToUpdate }),
  });
  if (!res.ok) throw new Error(await res.text());

  const result = await res.json();
  return result;
}
/* export async function editStudentInDB(mongoId: string, studentData: any) {
  const userId = localStorage.getItem("userId");
  const res = await fetch("/api/students", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId, data: { ...studentData, userId } }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
} */

export async function deleteStudentFromDB(mongoId: string) {
  const res = await fetch("/api/students", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function updateSessionStatus(
  mongoId: string,
  sessionId: string,
  attended: boolean,
  absent: boolean
) {
  const res = await fetch("/api/students/session", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mongoId, sessionId, attended, absent }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
