export async function fetchStudents() {
  const res = await fetch("/api/students");
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
  const res = await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

//eslint-disable-next-line
export async function editStudentInDB(mongoId: string, studentData: any) {
  const res = await fetch("/api/students", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId, data: studentData }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}

export async function deleteStudentFromDB(mongoId: string) {
  const res = await fetch("/api/students", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: mongoId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return await res.json();
}
