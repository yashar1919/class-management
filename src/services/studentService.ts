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
  // دریافت دانش‌آموز فعلی از لیست دانش‌آموزان موجود در استور
  // فرض: useStudentStore.getState().students همیشه به‌روز است
  let currentStudent;
  if (window.students) {
    //eslint-disable-next-line
    currentStudent = window.students.find((s: any) => s.mongoId === mongoId);
  } else {
    // اگر window.students نداری، از API بگیر
    const students = await fetchStudents();
    //eslint-disable-next-line
    currentStudent = students.find((s: any) => s.mongoId === mongoId);
  }

  const dataToUpdate = {
    ...studentData,
    userId,
    sessions: currentStudent?.sessions ?? [],
  };

  const res = await fetch("/api/students", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId, data: dataToUpdate }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
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
