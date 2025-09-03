import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addWeeks } from "date-fns";

export type Session = {
  date: Date;
  startTime: string;
  endTime: string;
  attended: boolean;
  price: string;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  address: string;
  classType: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: string;
  firstSessionDates: Date[]; // array of first session dates
  daysPerWeek: number;
  multiDay: boolean;
  sessions: Session[];
};

type StudentStore = {
  students: Student[];
  addStudent: (student: Omit<Student, "id">) => void;
  removeStudent: (id: string) => void;
  toggleAttendance: (studentId: string, sessionIdx: number) => void;
};

type NewStudent = Omit<Student, "id" | "sessions">;

export const useStudentStore = create<StudentStore>()(
  persist(
    (set) => ({
      students: [],
      addStudent: (student: NewStudent) =>
        set((state) => {
          let sessions: Session[] = [];
          student.firstSessionDates.forEach((firstDate: Date) => {
            for (let i = 0; i < 4; i++) {
              const sessionDate = addWeeks(new Date(firstDate), i);
              sessions.push({
                date: sessionDate,
                startTime: student.startTime,
                endTime: student.endTime,
                attended: false,
                price: student.price,
              });
            }
          });
          // مرتب‌سازی جلسات بر اساس تاریخ
          sessions = sessions.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          return {
            students: [
              ...state.students,
              {
                ...student,
                id: Date.now().toString(),
                sessions,
              },
            ],
          };
        }),
      removeStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),
      toggleAttendance: (studentId, sessionIdx) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === studentId
              ? {
                  ...student,
                  sessions: student.sessions.map((session, idx) =>
                    idx === sessionIdx
                      ? { ...session, attended: !session.attended }
                      : session
                  ),
                }
              : student
          ),
        })),
    }),
    {
      name: "students-storage", // نام کلید در localStorage
    }
  )
);
