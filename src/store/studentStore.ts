import { create } from "zustand";
// import { persist } from "zustand/middleware"; // localStorage disabled
import { addWeeks } from "date-fns";
import { updateSessionStatus } from "@/services/studentService";

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
  mongoId?: string;
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
  updateStudent: (id: string, data: NewStudent) => void;
  setStudents: (students: Student[]) => void;
};

type NewStudent = Omit<Student, "id" | "sessions">;

export const useStudentStore = create<StudentStore>()(
  // TODO: localStorage disabled - اطلاعات دانش‌آموزان حالا از بک‌اند می‌آیند
  // persist(
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
      set((state) => {
        const students = state.students.map((student) => {
          if (student.id === studentId || student.mongoId === studentId) {
            const sessions = student.sessions.map((session) => {
              if (session.id === sessionId) {
                // وضعیت جدید
                const newAttended = !session.attended;
                // آپدیت سرور
                if (student.mongoId) {
                  updateSessionStatus(
                    student.mongoId,
                    sessionId,
                    newAttended,
                    session.absent
                  );
                }
                return { ...session, attended: newAttended };
              }
              return session;
            });
            return { ...student, sessions };
          }
          return student;
        });
        return { students };
      }),
    toggleAbsent: (studentId: string, sessionId: string) =>
      set((state) => {
        const students = state.students.map((student) => {
          if (student.id === studentId || student.mongoId === studentId) {
            const sessions = student.sessions.map((session) => {
              if (session.id === sessionId) {
                const newAbsent = !session.absent;
                if (student.mongoId) {
                  updateSessionStatus(
                    student.mongoId,
                    sessionId,
                    session.attended,
                    newAbsent
                  );
                }
                return { ...session, absent: newAbsent };
              }
              return session;
            });
            return { ...student, sessions };
          }
          return student;
        });
        return { students };
      }),
    editingStudent: null, // اضافه شد
    setEditingStudent: (student) => set({ editingStudent: student }), // اضافه شد
    updateStudent: (id, data) =>
      set((state) => ({
        students: state.students.map((student) =>
          student.id === id || student.mongoId === id
            ? { ...student, ...data }
            : student
        ),
      })),
    setStudents: (students) => set({ students }), // این متد را اضافه کن
  })
  // {
  //   name: "students-storage", // localStorage برای دیتای دانش‌آموزان غیرفعال شد
  // }
);
