"use client";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import InputField from "./UI/InputField";
import { useStudentStore } from "../store/studentStore";
import {
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  ClusterOutlined,
  HistoryOutlined,
  SwapRightOutlined,
  DollarOutlined,
  SwapLeftOutlined,
  CalculatorOutlined,
} from "@ant-design/icons";
import {
  Checkbox,
  ConfigProvider,
  Button,
  theme,
  type MenuProps,
  message,
} from "antd";
import DropdownField from "./UI/DropdownField";
import TimePickerCustom from "./UI/TimePickerCustom";
import InputNumberField from "./UI/InputNumberField";
import dayjs from "dayjs";
import PersianCalendarPicker from "./UI/PersianCalendarPicker";
import { useState, useEffect, useCallback, useMemo } from "react";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";
import { addWeeks } from "date-fns";
import {
  addStudentToDB,
  editStudentInDB,
  fetchStudents,
} from "@/services/studentService";

const schema = yup.object({
  name: yup.string().required("Full name is required"),
  phone: yup
    .string()
    .matches(/^\d{8,15}$/, "Phone must be 8-15 digits")
    .nullable()
    .notRequired(),
  address: yup.string().required("Address is required"),
  age: yup
    .number()
    .typeError("سن باید عدد باشد")
    .required("وارد کردن سن الزامی است")
    .min(1, "سن باید بیشتر از ۰ باشد")
    .max(120, "سن معتبر وارد کنید"),
  classType: yup.string().required("Class type is required"),
  onlineLink: yup.string().url("لینک معتبر وارد کنید").notRequired(),
  duration: yup
    .number()
    .typeError("Duration must be a number")
    .min(1, "Min 1 hour")
    .max(8, "Max 8 hours")
    .required("Duration is required"),
  startTime: yup.string().required("Start time is required"),
  multiDay: yup.boolean().default(false),
  selectedDates: yup
    .array()
    .min(1, "At least one date must be selected")
    .required("At least one date must be selected"),
  daysPerWeek: yup
    .number()
    .when("multiDay", {
      is: true,
      then: (schema) =>
        schema
          .typeError("تعداد روزها باید عدد باشد")
          .min(2, "حداقل ۲ روز")
          .max(7, "حداکثر ۷ روز")
          .required("تعداد روزهای کلاس الزامی است"),
      otherwise: (schema) => schema.notRequired(),
    })
    .default(2),
  sessionPrice: yup
    .number()
    .typeError("Session price must be a number")
    .min(0, "Session price cannot be negative")
    .required("Session price is required"),
  studentDepositAmount: yup
    .number()
    .typeError("مبلغ واریزی باید عدد باشد")
    .min(0, "مبلغ واریزی نمی‌تواند منفی باشد")
    .default(0),
});

type FormValues = {
  name: string;
  phone?: string;
  address: string;
  age: number;
  classType: string;
  duration: number;
  startTime: string;
  multiDay: boolean;
  daysPerWeek: number;
  sessionPrice: number;
  studentDepositAmount: number;
  selectedDates: DateObject[];
  onlineLink?: string;
};

const defaultValues: FormValues = {
  name: "",
  phone: "",
  address: "",
  age: 1,
  classType: "",
  duration: 1,
  startTime: "",
  multiDay: false,
  daysPerWeek: 2,
  sessionPrice: 1,
  studentDepositAmount: 0,
  selectedDates: [],
  onlineLink: "",
};

export default function StudentForm() {
  const { t, i18n } = useTranslation();
  //const addStudent = useStudentStore((s) => s.addStudent);
  const editingStudent = useStudentStore((s) => s.editingStudent);
  const setEditingStudent = useStudentStore((s) => s.setEditingStudent);
  const updateStudent = useStudentStore((s) => s.updateStudent);
  const setStudents = useStudentStore((s) => s.setStudents);

  const classTypeItems: MenuProps["items"] = useMemo(
    () => [
      {
        label: t("studentForm.inPerson"),
        key: "in-person",
        icon: <ClusterOutlined />,
      },
      {
        label: t("studentForm.online"),
        key: "online",
        icon: <ClusterOutlined />,
      },
    ],
    [t]
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    //eslint-disable-next-line
    resolver: yupResolver(schema) as any,
    defaultValues,
    mode: "onTouched",
  });

  const multiDay = watch("multiDay");
  const selectedDates = watch("selectedDates");
  const startTimeValue = watch("startTime");
  const startTime = watch("startTime");
  const duration = watch("duration");
  const classTypeValue = watch("classType");

  useEffect(() => {
    if (multiDay) {
      setValue("daysPerWeek", selectedDates?.length || 1, {
        shouldValidate: true,
      });
    } else {
      setValue("daysPerWeek", 1, { shouldValidate: true });

      // اگر multiDay false شد و بیشتر از یک تاریخ انتخاب شده، فقط اولین تاریخ را نگه دار
      if (selectedDates && selectedDates.length > 1) {
        console.log(
          "Reducing selected dates from",
          selectedDates.length,
          "to 1"
        );
        setValue("selectedDates", [selectedDates[0]], {
          shouldValidate: true,
        });
      }
    }
  }, [multiDay, selectedDates, setValue]);

  const calcEndTime = useCallback((start: string, duration: number) => {
    if (!start) return "--:--";
    const [h, m] = start.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "--:--";
    let endHour = h + Number(duration);
    const endMinute = m;
    if (endHour >= 24) endHour = endHour % 24;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(endHour)}:${pad(endMinute)}`;
  }, []);

  const endTime = calcEndTime(startTime, duration);

  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!data.selectedDates || data.selectedDates.length === 0) {
      setCalendarError("Date is required");
      return;
    }
    setCalendarError(false);
    setLoading(true);

    const firstSessionDates = data.selectedDates.map(
      (dateObj) => new Date(dateObj.toDate())
    );
    // اگر multiDay false است، فقط اولین تاریخ را استفاده کن
    const finalSessionDates = data.multiDay
      ? firstSessionDates
      : [firstSessionDates[0]];
    const actualDaysPerWeek = data.multiDay ? data.selectedDates.length : 1;

    console.log("Form data for submission:", {
      multiDay: data.multiDay,
      selectedDatesLength: data.selectedDates.length,
      actualDaysPerWeek,
      firstSessionDatesLength: firstSessionDates.length,
    });

    let studentData;

    if (editingStudent && editingStudent.mongoId) {
      // برای ویرایش: sessions موجود را حفظ می‌کنیم
      studentData = {
        name: data.name,
        phone: data.phone || "",
        address: data.address,
        age: data.age,
        classType: data.classType,
        startTime: data.startTime,
        endTime: calcEndTime(data.startTime, data.duration),
        duration: data.duration,
        price: data.sessionPrice.toString(),
        depositAmount: data.studentDepositAmount,
        firstSessionDates: finalSessionDates,
        daysPerWeek: actualDaysPerWeek,
        multiDay: data.multiDay,
        onlineLink: data.onlineLink || "",
        // sessions موجود را حفظ می‌کنیم - از service layer مدیریت می‌شود
      };
    } else {
      // برای دانش‌آموز جدید: sessions جدید تولید می‌کنیم
      // محاسبه تعداد جلسات بر اساس مبلغ واریزی
      const totalPaidSessions = Math.floor(
        data.studentDepositAmount / data.sessionPrice
      );

      // منطق ماهانه: تولید جدول بر اساس ماه‌های کامل (هر ماه = 4 جلسه)
      const monthsNeeded = Math.ceil(totalPaidSessions / 4); // تعداد ماه‌های مورد نیاز
      const totalSessionsToGenerate = monthsNeeded * 4; // هر ماه 4 جلسه

      //eslint-disable-next-line
      const sessions: any[] = [];
      const daysPerWeek = finalSessionDates.length;

      console.log("Form session generation:", {
        totalPaidSessions,
        totalSessionsToGenerate,
        daysPerWeek,
        finalSessionDatesCount: finalSessionDates.length,
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
          const baseDate = finalSessionDates[dayIndex];
          const sessionDate = addWeeks(baseDate, weekCounter);
          const isPaid = sessionCounter < totalPaidSessions;

          sessions.push({
            id: `${Date.now()}_${Math.random()}_${sessionCounter}`,
            date: sessionDate,
            startTime: data.startTime,
            endTime: calcEndTime(data.startTime, data.duration),
            attended: false,
            absent: false,
            price: data.sessionPrice.toString(),
            deposit: isPaid,
            paid: isPaid,
          });

          sessionCounter++;
        }
        weekCounter++;
      }

      console.log("Form final session result:", {
        totalSessionsGenerated: sessions.length,
        paidSessions: sessions.filter((s) => s.paid).length,
        unpaidSessions: sessions.filter((s) => !s.paid).length,
      });

      studentData = {
        name: data.name,
        phone: data.phone || "",
        address: data.address,
        age: data.age,
        classType: data.classType,
        startTime: data.startTime,
        endTime: calcEndTime(data.startTime, data.duration),
        duration: data.duration,
        price: data.sessionPrice.toString(),
        depositAmount: data.studentDepositAmount,
        firstSessionDates: finalSessionDates,
        daysPerWeek: actualDaysPerWeek,
        multiDay: data.multiDay,
        onlineLink: data.onlineLink || "",
        sessions, // جدول جلسات با منطق درست
      };
    }

    try {
      if (editingStudent && editingStudent.mongoId) {
        // فراخوانی API بدون optimistic update تا current student در service درست باشد

        const updatedStudentData = await editStudentInDB(
          editingStudent.mongoId,
          studentData
        );
        console.log("Student edited in DB:", updatedStudentData);

        // بعد از موفقیت API، store را بروزرسانی کن
        if (updatedStudentData) {
          updateStudent(editingStudent.mongoId, {
            ...updatedStudentData,
            mongoId: editingStudent.mongoId,
          });
        }

        // اگر API موفق بود، داده‌های برگشتی را در store به‌روزرسانی کن
        if (updatedStudentData) {
          console.log("Updating store with:", {
            mongoId: editingStudent.mongoId,
            sessionsCount: updatedStudentData.sessions?.length,
            depositAmount: updatedStudentData.depositAmount,
          });
          updateStudent(editingStudent.mongoId, {
            ...updatedStudentData,
            mongoId: editingStudent.mongoId,
          });
        }

        messageApi.open({
          type: "success",
          content: "Student updated successfully!",
        });
      } else {
        await addStudentToDB(studentData);
        console.log("Student successfully POSTed to DB:", studentData);
        messageApi.open({
          type: "success",
          content: "Student added successfully!",
        });

        // برای دانش‌آموز جدید، همچنان لیست کامل را بروزرسانی کن
        const students = await fetchStudents();
        setStudents(students);
      }
      reset(defaultValues);
      setEditingStudent(null);
    } catch (err) {
      console.error("API error:", err);
      // در صورت خطا، داده‌ها را از سرور مجدداً بخوان
      const students = await fetchStudents();
      setStudents(students);
      messageApi.open({
        type: "error",
        content: "Error updating student. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editingStudent) {
      console.log("reset called with editingStudent:", editingStudent);
      reset({
        name: editingStudent.name,
        phone: editingStudent.phone,
        address: editingStudent.address,
        age: editingStudent.age,
        classType: editingStudent.classType,
        duration: editingStudent.duration,
        startTime: editingStudent.startTime,
        multiDay: editingStudent.multiDay,
        daysPerWeek: editingStudent.daysPerWeek,
        sessionPrice: Number(editingStudent.price),
        studentDepositAmount: editingStudent.depositAmount || 0,
        selectedDates: editingStudent.firstSessionDates.map(
          (d) => new DateObject(new Date(d))
        ),
        onlineLink: editingStudent.onlineLink,
      });
    }
  }, [editingStudent, reset]);

  useEffect(() => {
    setEditingStudent(null); // پاک کردن دانش‌آموز در حال ویرایش
    reset(defaultValues); // ریست کردن فرم به حالت اولیه
    //eslint-disable-next-line
  }, []);

  const [calendarError, setCalendarError] = useState<string | boolean>(false);

  return (
    <>
      {contextHolder}
      <form
        className="w-full max-w-[950px] mx-auto bg-[#141414] p-8 rounded-2xl flex flex-col gap-7 mt-8 mb-8"
        style={{ boxShadow: "0px 0px 7px gray" }}
        onSubmit={(e) => {
          console.log("form onSubmit event fired");
          handleSubmit(onSubmit)(e);
        }}
        noValidate
      >
        <h2 className="text-2xl sm:text-4xl font-bold text-teal-300 mb-2 text-center">
          {t("studentForm.addNewStudent")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          <div>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
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
                  <InputField
                    placeholder={t("studentForm.fullName")}
                    prefix={<UserOutlined />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.name}
                  />
                </ConfigProvider>
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 ml-2">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
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
                  <InputField
                    placeholder={t("studentForm.phone")}
                    prefix={<PhoneOutlined />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.phone}
                    type="tel"
                  />
                </ConfigProvider>
              )}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-7">
            <div>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
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
                    <InputField
                      placeholder={t("studentForm.address")}
                      prefix={<HomeOutlined />}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.address}
                    />
                  </ConfigProvider>
                )}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>
            <div>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <ConfigProvider
                    theme={{
                      algorithm: theme.darkAlgorithm,
                      components: {
                        InputNumber: {
                          colorPrimary: "#00bba7",
                          algorithm: true,
                        },
                      },
                    }}
                  >
                    <InputNumberField
                      placeholder={t("studentForm.age")}
                      addonBefore={<CalculatorOutlined />}
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.age}
                      min={1}
                      max={120}
                    />
                  </ConfigProvider>
                )}
              />
              {errors.age && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.age.message}
                </p>
              )}
            </div>
          </div>
          {classTypeValue === "online" ? (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-7">
              <div>
                <Controller
                  name="classType"
                  control={control}
                  render={({ field }) => (
                    <ConfigProvider
                      theme={{
                        algorithm: theme.darkAlgorithm,
                        components: {
                          Dropdown: {
                            colorPrimary: "#fff",
                            algorithm: true,
                          },
                        },
                      }}
                    >
                      <DropdownField
                        label={t("studentForm.classType")}
                        icon={<ClusterOutlined />}
                        items={classTypeItems}
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        error={!!errors.classType}
                      />
                    </ConfigProvider>
                  )}
                />
                {errors.classType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.classType.message}
                  </p>
                )}
              </div>
              <div>
                <Controller
                  name="onlineLink"
                  control={control}
                  render={({ field }) => (
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
                      <InputField
                        placeholder={
                          t("studentForm.onlineLink") || "Google Meet Link"
                        }
                        prefix={<ClusterOutlined />}
                        value={field.value}
                        onChange={field.onChange}
                        error={!!errors.onlineLink}
                        type="url"
                      />
                    </ConfigProvider>
                  )}
                />
                {errors.onlineLink && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.onlineLink.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="md:col-span-2">
              <Controller
                name="classType"
                control={control}
                render={({ field }) => (
                  <ConfigProvider
                    theme={{
                      algorithm: theme.darkAlgorithm,
                      components: {
                        Dropdown: {
                          colorPrimary: "#fff",
                          algorithm: true,
                        },
                      },
                    }}
                  >
                    <DropdownField
                      label={t("studentForm.classType")}
                      icon={<ClusterOutlined />}
                      items={classTypeItems}
                      value={field.value}
                      onChange={(val) => field.onChange(val)}
                      error={!!errors.classType}
                    />
                  </ConfigProvider>
                )}
              />
              {errors.classType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.classType.message}
                </p>
              )}
            </div>
          )}

          <div className="md:col-span-2">
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <ConfigProvider
                  theme={{
                    algorithm: theme.darkAlgorithm,
                    components: {
                      InputNumber: {
                        colorPrimary: "#00bba7",
                        algorithm: true,
                      },
                    },
                  }}
                >
                  <InputNumberField
                    placeholder={t("studentForm.durationHours")}
                    addonBefore={<HistoryOutlined />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.duration}
                  />
                </ConfigProvider>
              )}
            />
            {errors.duration && (
              <p className="text-red-500 text-xs mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-5 items-center w-full">
            <div className="col-span-2">
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <ConfigProvider
                    theme={{
                      algorithm: theme.darkAlgorithm,
                      components: {
                        DatePicker: {
                          colorPrimary: "#00bba7",
                          algorithm: true,
                        },
                      },
                    }}
                  >
                    <TimePickerCustom
                      value={field.value ? dayjs(field.value, "HH:mm") : null}
                      onChange={(val) => {
                        if (val && typeof val.format === "function") {
                          console.log("onChange value:", val.format("HH:mm"));
                          field.onChange(val.format("HH:mm"));
                        } else {
                          console.log("onChange value:", val);
                          field.onChange(val);
                        }
                      }}
                      error={!!errors.startTime}
                      placeholder={t("studentForm.startTime")}
                    />
                  </ConfigProvider>
                )}
              />
              {errors.startTime && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div className="col-span-1 text-center">
              {i18n.language === "fa" ? (
                <SwapLeftOutlined
                  style={{
                    color: startTimeValue ? "#00bba7" : "gray",
                    fontSize: "24px",
                  }}
                />
              ) : (
                <SwapRightOutlined
                  style={{
                    color: startTimeValue ? "#00bba7" : "gray",
                    fontSize: "24px",
                  }}
                />
              )}
            </div>
            <div className="flex items-center col-span-2">
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm,
                  components: {
                    DatePicker: {
                      colorPrimary: "#00bba7",
                      algorithm: true,
                    },
                  },
                }}
              >
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">
                    {t("studentForm.endTime")}:
                  </p>
                  <InputField
                    value={endTime}
                    disabled
                    className="text-center"
                  />
                </div>
              </ConfigProvider>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Controller
              name="multiDay"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <ConfigProvider
                  theme={{
                    algorithm: theme.darkAlgorithm,
                    components: {
                      Checkbox: {
                        colorPrimary: "#00bba7",
                        algorithm: true,
                      },
                    },
                  }}
                >
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  >
                    <p className="text-sm">
                      {t("studentForm.isClassMoreThanOneDay")}
                    </p>
                  </Checkbox>
                </ConfigProvider>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <Controller
              name="selectedDates"
              control={control}
              render={({ field }) => (
                <PersianCalendarPicker
                  value={field.value}
                  onChange={field.onChange}
                  multiple={multiDay}
                  error={errors.selectedDates?.message}
                />
              )}
            />
            {errors.selectedDates && (
              <p className="text-red-500 text-xs mt-1">
                {errors.selectedDates.message}
              </p>
            )}
            {calendarError && (
              <p className="text-red-500 text-xs mt-1">
                {typeof calendarError === "string"
                  ? calendarError
                  : "لطفاً یک یا چند روز را انتخاب کنید"}
              </p>
            )}
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Controller
              name="sessionPrice"
              control={control}
              defaultValue={1}
              render={({ field }) => (
                <ConfigProvider
                  theme={{
                    algorithm: theme.darkAlgorithm,
                    components: {
                      InputNumber: {
                        colorPrimary: "#00bba7",
                        algorithm: true,
                      },
                    },
                  }}
                >
                  <InputNumberField
                    placeholder={t("studentForm.sessionPrice")}
                    addonBefore={<DollarOutlined />}
                    value={field.value}
                    onChange={field.onChange}
                    error={!!errors.sessionPrice}
                    formatter={(value: string | number | undefined) =>
                      value
                        ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : ""
                    }
                    parser={(value: string | undefined) =>
                      value ? value.replace(/(,*)/g, "") : ""
                    }
                  />
                </ConfigProvider>
              )}
            />
            {errors.sessionPrice && (
              <p className="text-red-500 text-xs mt-1">
                {errors.sessionPrice.message}
              </p>
            )}
            {/* Student Deposit Amount Field - Full Width */}
            <Controller
              name="studentDepositAmount"
              control={control}
              render={({ field }) => (
                <ConfigProvider
                  theme={{
                    algorithm: theme.darkAlgorithm,
                    components: {
                      InputNumber: {
                        colorPrimary: "#00bba7",
                        algorithm: true,
                      },
                    },
                  }}
                >
                  <InputNumberField
                    placeholder="Student Deposit Amount"
                    addonBefore={<DollarOutlined />}
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    error={!!errors.studentDepositAmount}
                    formatter={(value: string | number | undefined) => {
                      if (
                        value === undefined ||
                        value === null ||
                        value === ""
                      ) {
                        return "";
                      }
                      return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }}
                    parser={(value: string | undefined) =>
                      value ? value.replace(/(,*)/g, "") : ""
                    }
                    min={0}
                  />
                </ConfigProvider>
              )}
            />
            {errors.studentDepositAmount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.studentDepositAmount.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mt-5">
          {/* دکمه لغو فقط در حالت ویرایش نمایش داده شود */}
          {editingStudent && (
            <Button
              type="default"
              style={{
                backgroundColor: "transparent",
                color: "#d32626",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 500,
                padding: "19px 0px",
                border: "1px solid #d32626",
                width: "100%",
              }}
              onClick={() => {
                setEditingStudent(null);
                reset(defaultValues);
              }}
            >
              {t("studentForm.cancel") || "Cancel"}
            </Button>
          )}
          <Button
            type="default"
            htmlType="submit"
            style={{
              background: "#00aa98",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 500,
              padding: "19px 0px",
              border: "none",
              width: "100%",
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            loading={loading}
            disabled={loading}
            onClick={() => {
              console.log("Submit button clicked");
            }}
          >
            {loading
              ? t("studentForm.loading") || "در حال ثبت..."
              : editingStudent
                ? t("studentForm.editStudent") || "Edit Student"
                : t("studentForm.addStudent")}
          </Button>
        </div>
      </form>
    </>
  );
}
