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
} from "@ant-design/icons";
import { Checkbox, ConfigProvider, Button, theme, type MenuProps } from "antd";
import DropdownField from "./UI/DropdownField";
import TimePickerCustom from "./UI/TimePickerCustom";
import InputNumberField from "./UI/InputNumberField";
import dayjs from "dayjs";
import PersianCalendarPicker from "./UI/PersianCalendarPicker";
import { useState } from "react";
import { DateObject } from "react-multi-date-picker";
import { useTranslation } from "react-i18next";

const classTypeItems: MenuProps["items"] = [
  { label: "Offline", key: "Offline", icon: <ClusterOutlined /> },
  { label: "Online", key: "Online", icon: <ClusterOutlined /> },
];

const schema = yup.object({
  name: yup.string().required("Full name is required"),
  phone: yup
    .string()
    .matches(/^\d{8,15}$/, "Phone must be 8-15 digits")
    .nullable()
    .notRequired(),
  address: yup.string().required("Address is required"),
  classType: yup.string().required("Class type is required"),
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
});

type FormValues = {
  name: string;
  phone?: string;
  address: string;
  classType: string;
  duration: number;
  startTime: string;
  multiDay: boolean;
  daysPerWeek: number;
  sessionPrice: number;
  selectedDates: DateObject[];
};

const defaultValues: FormValues = {
  name: "",
  phone: "",
  address: "",
  classType: "",
  duration: 1,
  startTime: "",
  multiDay: false,
  daysPerWeek: 2,
  sessionPrice: 1,
  selectedDates: [],
};

export default function StudentForm() {
  const { t } = useTranslation();
  const addStudent = useStudentStore((s) => s.addStudent);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    //eslint-disable-next-line
    resolver: yupResolver(schema) as any,
    defaultValues,
    mode: "onTouched",
  });

  /* const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // ... سایر فیلدها ...
      selectedDates: [],
    },
    resolver: yupResolver(schema),
  }); */

  const multiDay = watch("multiDay");
  //const daysPerWeek = watch("daysPerWeek");

  const startTimeValue = watch("startTime");
  //console.log("startTime value:", startTimeValue);

  const startTime = watch("startTime"); // رشته مثل "03:05"
  const duration = watch("duration"); // عدد

  function calcEndTime(start: string, duration: number) {
    if (!start) return "--:--";
    const [h, m] = start.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return "--:--";
    let endHour = h + Number(duration);
    const endMinute = m;
    // اگر ساعت از 24 گذشت، به 0 برگردد
    if (endHour >= 24) endHour = endHour % 24;
    // فرمت دو رقمی
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(endHour)}:${pad(endMinute)}`;
  }

  const endTime = calcEndTime(startTime, duration);

  /* const onSubmit: SubmitHandler<FormValues> = (data) => {
    addStudent({
      ...data,
      sessions: [],
      classType: "Offline",
      startTime: "00:00",
      endTime: "00:00",
      duration: 1,
      price: 0,
      firstSessionDates: [],
      daysPerWeek: 1,
      multiDay: false,
    });
    reset();
    setSelectedDates([new DateObject()]);
  }; */

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (!data.selectedDates || data.selectedDates.length === 0) {
      setCalendarError("Date is required");
      return;
    }
    setCalendarError(false);
    console.log("calendarError set:", false);

    // تبدیل selectedDates به firstSessionDates
    const firstSessionDates = data.selectedDates.map(
      (dateObj) => new Date(dateObj.toDate())
    );

    // محاسبه daysPerWeek بر اساس تعداد روزهای انتخاب شده
    const actualDaysPerWeek = data.multiDay ? data.selectedDates.length : 1;

    addStudent({
      name: data.name,
      phone: data.phone || "",
      address: data.address,
      classType: data.classType,
      startTime: data.startTime,
      endTime: calcEndTime(data.startTime, data.duration),
      duration: data.duration,
      price: data.sessionPrice.toString(),
      firstSessionDates,
      daysPerWeek: actualDaysPerWeek,
      multiDay: data.multiDay,
    });
    reset();
    //setSelectedDates([]);
  };

  //const [selectedDates, setSelectedDates] = useState<DateObject[]>([]);
  const [calendarError, setCalendarError] = useState<string | boolean>(false);

  return (
    <form
      className="w-full max-w-3xl mx-auto bg-[#141414] p-8 rounded-3xl flex flex-col gap-7 mt-8 mb-20"
      style={{ boxShadow: "0px 0px 7px gray" }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h2 className="text-3xl font-bold text-teal-400 mb-2 text-center">
        Add New Student
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
                      colorPrimary: "#008080",
                      algorithm: true,
                    },
                  },
                }}
              >
                <InputField
                  placeholder="Full Name"
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
                      colorPrimary: "#008080",
                      algorithm: true,
                    },
                  },
                }}
              >
                <InputField
                  placeholder="Phone"
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
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <ConfigProvider
                theme={{
                  algorithm: theme.darkAlgorithm,
                  components: {
                    Input: {
                      colorPrimary: "#008080",
                      algorithm: true,
                    },
                  },
                }}
              >
                <InputField
                  placeholder="Address"
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
                  label="Class Type"
                  icon={<ClusterOutlined />}
                  items={classTypeItems}
                  value={field.value}
                  onChange={(val) =>
                    field.onChange(val === "Offline" ? "Offline" : "Online")
                  }
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
                      colorPrimary: "#008080",
                      algorithm: true,
                    },
                  },
                }}
              >
                <InputNumberField
                  placeholder="Duration (hours)"
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
                        colorPrimary: "#008080",
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
                    placeholder="Start Time"
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
            <SwapRightOutlined
              style={{
                color: startTimeValue ? "#008080" : "gray",
                fontSize: "24px",
              }}
            />
          </div>
          {/* <div className="text-start col-span-1">
            <p className="text-gray-400 text-xs mb-1">End Time</p>
            <p className="text-lg font-medium text-white">{endTime}</p>
          </div> */}
          <div className="flex items-center col-span-2">
            {/* <p className="text-gray-400 text-xs mb-1">End Time:</p>
            <p className="text-lg font-bold text-white">{endTime}</p> */}

            <ConfigProvider
              theme={{
                algorithm: theme.darkAlgorithm,
                components: {
                  DatePicker: {
                    colorPrimary: "#008080",
                    algorithm: true,
                  },
                },
              }}
            >
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">End Time:</p>
                <InputField value={endTime} disabled className="text-center" />
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
                      colorPrimary: "#008080",
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
                    Is the class more than one day a week?
                  </p>
                </Checkbox>
              </ConfigProvider>
            )}
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          <div className="w-6/7">
            {/* <Controller
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
            /> */}

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
                      colorPrimary: "#008080",
                      algorithm: true,
                    },
                  },
                }}
              >
                {/* <InputNumberField
                  placeholder="Session Price"
                  addonBefore={<DollarOutlined />}
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.sessionPrice}
                /> */}

                <InputNumberField
                  placeholder="Session Price"
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
        </div>
      </div>
      <Button
        type="default"
        htmlType="submit"
        style={{
          background: "#008080",
          color: "#fff",
          borderRadius: "10px",
          fontSize: "16px",
          padding: "19px 0px",
          border: "none",
          marginTop: "30px",
        }}
      >
        {t("add_student")}
      </Button>
    </form>
  );
}
