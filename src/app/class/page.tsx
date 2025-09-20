"use client";

import StudentForm from "@/components/StudentForm";
import StudentList from "@/components/StudentList";
import { useState } from "react";

type Student = {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  age?: number;
  classType: string;
  duration: number;
  startTime?: string;
  endTime?: string;
  multiDay?: boolean;
  daysPerWeek: number;
  price: number | string;
  firstSessionDates?: string[];
  onlineLink?: string;
  sessions?: { date: string }[];
  // هر فیلد دیگری که داری اضافه کن
};

export default function ClassPage() {
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  return (
    <>
      <StudentForm
        editStudent={editStudent}
        onEditDone={() => setEditStudent(null)}
      />
      <StudentList onEditStudent={setEditStudent} />
    </>
  );
}
