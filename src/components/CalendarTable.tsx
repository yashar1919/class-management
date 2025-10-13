import React, { useMemo, useEffect, useState } from "react";
import {
  Table,
  Tag,
  ConfigProvider,
  theme,
  Button,
  notification,
  Input,
} from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useStudentStore } from "../store/studentStore";
import { useTranslation } from "react-i18next";
import ModalCustom from "./UI/ModalCustom";

const { TextArea } = Input;

const weekDaysFa: Record<string, string> = {
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنج‌شنبه",
  Friday: "جمعه",
  Saturday: "شنبه",
};

function getWeekDayFa(date: Date) {
  const en = date.toLocaleDateString("en-US", { weekday: "long" });
  return weekDaysFa[en] || en;
}

function getWeekDayEn(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

// تابع محاسبه شماره هفته از اولین جلسه
function getWeekNumber(date: Date, firstSessionDate: Date): number {
  const diffTime = date.getTime() - firstSessionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

type CalendarTableProps = {
  //student: Student;
  studentId: string;
};

interface SessionRow {
  key: string;
  session: number;
  date: string;
  weekday: string;
  startTime: string;
  endTime: string;
  attended: boolean;
  absent?: boolean;
  weekNumber: number;
  price: string | number;
  deposit: React.ReactNode;
}

export default function CalendarTable({ studentId }: CalendarTableProps) {
  const student = useStudentStore((s) =>
    s.students.find((stu) => stu.id === studentId || stu.mongoId === studentId)
  );

  const toggleAttendance = useStudentStore((s) => s.toggleAttendance);
  const toggleAbsent = useStudentStore((s) => s.toggleAbsent);
  const { t, i18n } = useTranslation();

  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [isModalDismissed, setIsModalDismissed] = useState(false);

  const defaultSmsText = student
    ? `${student.name} عزیز، زمان پرداخت شهریه کلاس شما فرا رسیده است. لطفا جهت ادامه جلسات، پرداخت را انجام دهید.`
    : "";

  // محاسبه آمار پرداخت ماهانه
  const paymentStats = useMemo(() => {
    if (!student?.sessions)
      return {
        totalPaid: 0,
        totalRemaining: 0,
        paidAmount: 0,
        remainingAmount: 0,
        totalMonths: 0,
        paidMonths: 0,
        remainingMonths: 0,
      };

    const paidSessionsCount = student.sessions.filter(
      (s) => s.paid || s.deposit
    ).length;
    const totalSessions = student.sessions.length;
    const sessionPrice = parseFloat(student.price) || 0;

    // محاسبات ماهانه (هر ماه = 4 جلسه)
    const totalMonths = Math.ceil(totalSessions / 4);
    const paidMonths = Math.floor(paidSessionsCount / 4);
    const remainingMonths = totalMonths - paidMonths;

    return {
      totalPaid: paidSessionsCount,
      totalRemaining: totalSessions - paidSessionsCount,
      paidAmount: paidSessionsCount * sessionPrice,
      remainingAmount: (totalSessions - paidSessionsCount) * sessionPrice,
      totalMonths,
      paidMonths,
      remainingMonths,
    };
  }, [student]);

  // مقدار اولیه smsText با متن دیفالت
  const [smsText, setSmsText] = useState(defaultSmsText);

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    // هر بار student تغییر کرد، مقدار smsText را با متن دیفالت مقداردهی کن
    setSmsText(defaultSmsText);
  }, [defaultSmsText]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);

    // Throttle function to limit resize event frequency
    const throttle = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      let lastExecTime = 0;
      return () => {
        const currentTime = Date.now();

        if (currentTime - lastExecTime > delay) {
          func();
          lastExecTime = currentTime;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(
            () => {
              func();
              lastExecTime = Date.now();
            },
            delay - (currentTime - lastExecTime)
          );
        }
      };
    };

    const throttledCheckMobile = throttle(checkMobile, 250); // 250ms throttle

    checkMobile(); // Initial check
    window.addEventListener("resize", throttledCheckMobile);
    return () => window.removeEventListener("resize", throttledCheckMobile);
  }, []);

  // محاسبه data با useMemo برای بهینه‌سازی عملکرد
  const data: SessionRow[] = useMemo(() => {
    if (!student || !student.sessions) return [];
    // Sort sessions by date ascending
    const sortedSessions = [...student.sessions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // پیدا کردن اولین تاریخ جلسه برای محاسبه شماره هفته
    const firstSessionDate =
      sortedSessions.length > 0 ? new Date(sortedSessions[0].date) : new Date();

    return sortedSessions.map((session, idx) => {
      const sessionDate = new Date(session.date);
      const weekNumber = getWeekNumber(sessionDate, firstSessionDate);

      return {
        key: session.id,
        session: idx + 1,
        date: new Date(session.date).toLocaleDateString("fa-IR"),
        /* date: new Date(session.date).toLocaleDateString(
          i18n.language === "fa" ? "fa-IR" : "en-US"
        ), */
        weekday:
          i18n.language === "fa"
            ? getWeekDayFa(new Date(session.date))
            : getWeekDayEn(new Date(session.date)),
        startTime: session.startTime,
        endTime: session.endTime,
        attended: session.attended,
        absent: session.absent,
        price: session.price,
        weekNumber, // اضافه کردن شماره هفته
        deposit:
          session.deposit || session.paid ? (
            <Tag color="green" className="tag-xs">
              {t("table.tuitionDone")}
            </Tag>
          ) : (
            <Tag color="yellow" className="tag-xs">
              {t("table.tuitionRequired")}
            </Tag>
          ),
      };
    });
  }, [student, t, i18n.language]);

  // Reset dismiss state when student changes
  useEffect(() => {
    setIsModalDismissed(false);
  }, [student?.id]); // Reset when student changes

  useEffect(() => {
    if (!student || !student.sessions) return;

    // فقط جلساتی که پرداخت شده‌اند (deposit یا paid = true)
    const paidRows = data.filter((row) => {
      const session = student.sessions.find((s) => s.id === row.key);
      return session && (session.deposit || session.paid);
    });

    // آیا همه جلسات پرداخت شده attended=true هستند؟
    const allPaidAttended =
      paidRows.length > 0 && paidRows.every((row) => row.attended);

    // اگر کاربر تیک‌ها را تغییر داده، dismiss state را reset کن
    if (!allPaidAttended) {
      setIsModalOpen(false);
      setIsModalDismissed(false); // Reset dismiss state when conditions change
    } else if (allPaidAttended && student && !isModalDismissed) {
      // فقط زمانی مودال را باز کن که کاربر آن را manually نبسته باشد
      setIsModalOpen(true);
    }
  }, [data, student, isModalDismissed]);

  const handleSendSMS = async () => {
    if (!student) return;
    setSendingSMS(true);
    try {
      const res = await fetch("/api/payment-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: student.name,
          phone: student.phone,
          customText: smsText.trim() ? smsText : defaultSmsText,
        }),
      });
      const result = await res.json();
      if (result.success) {
        api.success({
          message: "ارسال شد",
          description: "پیامک پرداخت با موفقیت ارسال شد.",
          placement: "top",
        });
      } else {
        api.error({
          message: "خطا",
          description: "ارسال پیامک با خطا مواجه شد.",
          placement: "top",
        });
      }
      //eslint-disable-next-line
    } catch (err) {
      api.error({
        message: "خطا",
        description: "ارسال پیامک با خطا مواجه شد.",
        placement: "top",
      });
    } finally {
      setSendingSMS(false);
      setIsModalOpen(false);
      setIsModalDismissed(true);
      setSmsText(""); // پاک کردن متن بعد از ارسال
    }
  };

  const selectedRowKeys = data
    .filter((row) => row.attended)
    .map((row) => row.key);

  const columns: ColumnsType<SessionRow> = useMemo(() => {
    const baseColumns: ColumnsType<SessionRow> = [
      {
        title: t("table.absent") || "Absent",
        dataIndex: "absent",
        key: "absent",
        align: "center",
        width: 50,
        render: (_: unknown, record: SessionRow) => (
          <span
            className="flex items-center justify-center"
            style={{ minHeight: 24 }}
          >
            <input
              type="checkbox"
              checked={!!record.absent}
              onChange={() => {
                if (!student) return;
                const studentIdentifier = student.mongoId || student.id;
                if (!record.absent) {
                  if (record.attended)
                    toggleAttendance(studentIdentifier, record.key);
                }
                toggleAbsent(studentIdentifier, record.key);
              }}
              className="accent-red-500 w-5 h-5"
              style={{ display: "none" }}
              id={`absent-checkbox-${record.key}`}
            />
            <label htmlFor={`absent-checkbox-${record.key}`}>
              {!!record.absent ? (
                <CloseCircleFilled
                  style={{
                    color: "oklch(71.2% 0.194 13.428)",
                    fontSize: 20,
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              ) : (
                <span
                  style={{
                    display: "inline-block",
                    width: 20,
                    height: 20,
                    border: "2px solid oklch(57.7% 0.245 27.325)",
                    borderRadius: "50%",
                    verticalAlign: "middle",
                    cursor: "pointer",
                  }}
                />
              )}
            </label>
          </span>
        ),
      },
      {
        title: t("table.session"),
        dataIndex: "session",
        key: "session",
        align: "center",
        width: 50,
      },
      {
        title: t("table.date"),
        dataIndex: "date",
        key: "date",
        align: "center",
        width: 80,
      },
      {
        title: t("table.weekday"),
        dataIndex: "weekday",
        key: "weekday",
        align: "center",
        width: 70,
      },
      {
        title: t("table.start"),
        dataIndex: "startTime",
        key: "startTime",
        align: "center",
        width: 60,
      },
      {
        title: t("table.end"),
        dataIndex: "endTime",
        key: "endTime",
        align: "center",
        width: 60,
      },
    ];
    // فقط اگر موبایل نیست ستون price را اضافه کن
    if (!isMobile) {
      baseColumns.push({
        title: t("table.price"),
        dataIndex: "price",
        key: "price",
        align: "center",
        width: 90,
      });
    }
    baseColumns.push({
      title: t("table.deposit"),
      dataIndex: "deposit",
      key: "deposit",
      align: "center",
      width: 130,
    });
    return baseColumns;
    //eslint-disable-next-line
  }, [t, isMobile]);

  const rowSelection: TableProps<SessionRow>["rowSelection"] = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      if (!student) return;
      const studentIdentifier = student.mongoId || student.id;
      data.forEach((row) => {
        const shouldBeAttended = selectedKeys.includes(row.key);
        if (row.attended !== shouldBeAttended) {
          if (shouldBeAttended && row.absent) {
            toggleAbsent(studentIdentifier, row.key);
          }
          toggleAttendance(studentIdentifier, row.key);
        }
      });
    },
    columnTitle: t("table.attendance"),
    columnWidth: 50,
  };

  function rowClassName(record: SessionRow, index?: number) {
    // رنگ‌های متفاوت برای هر هفته
    const weekColors = [
      "week-1", // هفته 1
      "week-2", // هفته 2
      "week-3", // هفته 3
      "week-4", // هفته 4
      "week-5", // هفته 5
    ];

    const colorIndex = (record.weekNumber - 1) % weekColors.length;
    let classes = `text-white ${weekColors[colorIndex]}`;

    // اگر اولین جلسه هفته است، border بالا اضافه کن
    const isFirstOfWeek =
      index === 0 ||
      (index && data[index - 1]?.weekNumber !== record.weekNumber);
    if (isFirstOfWeek) {
      classes += " first-of-week";
    }

    // اگر غایب است، row-absent class هم اضافه کن
    if (record.absent) {
      classes += " row-absent";
    }

    return classes;
  }

  if (!student || !student.sessions) {
    return <div className="text-gray-500">No session data available.</div>;
  }

  return (
    <>
      {contextHolder}

      {/* نمایش آمار ماهانه */}
      {student && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-600">
          <div className="text-center mb-3">
            <h3 className="text-lg font-bold text-teal-400">
              آمار ماهانه کلاس‌ها
            </h3>
            <p className="text-xs text-gray-400">هر ماه = 4 جلسه</p>
          </div>

          {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mb-4">
            <div>
              <p className="text-xs text-gray-400">ماه‌های پرداخت شده</p>
              <p className="text-lg font-bold text-green-400">
                {paymentStats.paidMonths}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">ماه‌های باقی‌مانده</p>
              <p className="text-lg font-bold text-yellow-400">
                {paymentStats.remainingMonths}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">کل ماه‌ها</p>
              <p className="text-lg font-bold text-blue-400">
                {paymentStats.totalMonths}
              </p>
            </div>
          </div> */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            <div>
              <p className="text-xs text-gray-400">جلسات پرداخت شده</p>
              <p className="font-bold text-green-400">
                {paymentStats.totalPaid}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">جلسات باقی‌مانده</p>
              <p className="font-bold text-yellow-400">
                {paymentStats.totalRemaining}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">مبلغ دریافتی</p>
              <p className="text-xs font-bold text-green-400">
                {paymentStats.paidAmount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">مبلغ باقی‌مانده</p>
              <p className="text-xs font-bold text-red-400">
                {paymentStats.remainingAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {student.depositAmount && (
            <div className="mt-3 pt-3 border-t border-gray-600">
              <p className="text-xs text-gray-400 text-center">
                مبلغ واریزی اولیه:{" "}
                <span className="text-teal-400 font-bold">
                  {student.depositAmount.toLocaleString()} تومان
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      <ModalCustom
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsModalDismissed(true);
        }}
        footer={null}
        title=""
        className="text-right "
      >
        <div className="px-8" style={{ direction: "rtl" }}>
          <p className="text-center w-full block text-2xl text-teal-600 font-bold">
            ارسال پیامک پرداخت
          </p>
          <p className="my-5">
            زمان پرداخت شهریه برای دانش‌آموز{" "}
            <span className="font-bold text-teal-700">{student?.name}</span> با
            شماره{" "}
            <span className="font-bold text-teal-700">{student?.phone}</span>{" "}
            فرا رسیده است.
            <br />
            اگر می‌خواهید پیامک پرداخت ارسال شود، متن زیر را ویرایش کنید یا همان
            متن دیفالت را ارسال کنید.
          </p>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              components: {
                Input: {
                  colorPrimary: "#00bba7",
                  algorithm: true,
                },
              },
            }}
          >
            <TextArea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="متن پیامک پرداخت"
              rows={4}
              dir="rtl"
              style={{
                textAlign: "right",
                direction: "rtl",
              }}
              className="text-lg"
            />
          </ConfigProvider>
          <div className="flex justify-between items-center gap-4 mt-5">
            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                  Button: {
                    colorPrimary: "#00bba7",
                    algorithm: true,
                  },
                },
              }}
            >
              <Button
                key="send"
                type="primary"
                loading={sendingSMS}
                onClick={handleSendSMS}
                className="w-full"
              >
                ارسال
              </Button>
              <Button
                key="cancel"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsModalDismissed(true);
                }}
                className="w-full"
              >
                لغو
              </Button>
            </ConfigProvider>
          </div>
        </div>
      </ModalCustom>

      <div
        className="overflow-x-auto rounded-lg border border-gray-500"
        style={{ maxHeight: 300, overflowY: "auto" }}
      >
        <ConfigProvider
          theme={{
            algorithm: theme.darkAlgorithm,
            components: {
              Table: {
                colorPrimary: "#00bba7",
                algorithm: true,
              },
            },
          }}
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
            bordered
            scroll={{ y: 250 }}
            rowSelection={rowSelection}
            rowClassName={rowClassName}
          />
        </ConfigProvider>
      </div>
    </>
  );
}
