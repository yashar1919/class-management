import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addWeeks } from "date-fns";

export type Session = {
  date: Date;
  startTime: string;
  endTime: string;
  attended: boolean;
  absent: boolean;
  price: string;
  //eslint-disable-next-line
  id: any;
};

export type Student = {
  id: string;
  name: string;
  phone: string;
  address: string;
  age: number;
  classType: string;
  onlineLink: string;
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
  addStudent: (student: NewStudent) => void;
  removeStudent: (id: string) => void;
  /* toggleAttendance: (studentId: string, sessionIdx: number) => void;
  toggleAbsent: (studentId: string, sessionKey: number) => void; */
  toggleAttendance: (studentId: string, sessionId: string) => void;
  toggleAbsent: (studentId: string, sessionId: string) => void;
  editingStudent: Student | null;
  setEditingStudent: (student: Student | null) => void;
  updateStudent: (id: string, data: NewStudent) => void; // اضافه شد
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
            for (let i = 0; i < 5; i++) {
              // تغییر از 4 به 5
              const sessionDate = addWeeks(new Date(firstDate), i);
              sessions.push({
                id: Date.now().toString() + Math.random(), // id یکتا
                date: sessionDate,
                startTime: student.startTime,
                endTime: student.endTime,
                attended: false,
                absent: false,
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
      toggleAttendance: (studentId, sessionId) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === studentId
              ? {
                  ...student,
                  sessions: student.sessions.map((session) =>
                    session.id === sessionId
                      ? { ...session, attended: !session.attended }
                      : session
                  ),
                }
              : student
          ),
        })),
      toggleAbsent: (studentId: string, sessionId: string) =>
        set((state) => ({
          students: state.students.map((student) =>
            student.id === studentId
              ? {
                  ...student,
                  sessions: student.sessions.map((session) =>
                    session.id === sessionId
                      ? { ...session, absent: !session.absent }
                      : session
                  ),
                }
              : student
          ),
        })),
      editingStudent: null, // اضافه شد
      setEditingStudent: (student) => set({ editingStudent: student }), // اضافه شد
      updateStudent: (id, data) =>
        set((state) => {
          // ساخت مجدد sessions مثل addStudent
          let sessions: Session[] = [];
          data.firstSessionDates.forEach((firstDate: Date) => {
            for (let i = 0; i < 5; i++) {
              const sessionDate = addWeeks(new Date(firstDate), i);
              sessions.push({
                id: Date.now().toString() + Math.random(), // id یکتا
                date: sessionDate,
                startTime: data.startTime,
                endTime: data.endTime,
                attended: false,
                absent: false,
                price: data.price,
              });
            }
          });
          sessions = sessions.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          return {
            students: state.students.map((student) =>
              student.id === id ? { ...student, ...data, sessions } : student
            ),
            editingStudent: null, // بعد از ویرایش، فرم ریست شود
          };
        }),
    }),
    {
      name: "students-storage", // نام کلید در localStorage
    }
  )
);
