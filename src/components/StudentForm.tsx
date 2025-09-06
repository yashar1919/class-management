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
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import DropdownField from "./UI/DropdownField";
import TimePickerCustom from "./UI/TimePickerCustom";

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
  startTime: yup.string().required("Start time is required"),
});

type FormValues = {
  name: string;
  phone?: string;
  address: string;
  classType: string;
  startTime: string;
};

const defaultValues: FormValues = {
  name: "",
  phone: "",
  address: "",
  classType: "",
  startTime: "",
};

export default function StudentForm() {
  const addStudent = useStudentStore((s) => s.addStudent);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any, // رفع خطای تایپ اسکریپت
    defaultValues,
    mode: "onTouched",
  });

  // فقط برای تست، بعداً بقیه فیلدها اضافه می‌شود
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    addStudent({
      ...data,
      // مقادیر تستی برای فیلدهای اجباری دیگر
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
  };

  return (
    <form
      className="w-full max-w-xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-lg flex flex-col gap-7 mt-8 mb-20"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h2 className="text-3xl font-bold text-teal-400 mb-2 text-center">
        Add New Student
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <InputField
                placeholder="Full Name"
                prefix={<UserOutlined />}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.name}
              />
            )}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <InputField
                placeholder="Phone"
                prefix={<PhoneOutlined />}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.phone}
                type="tel"
              />
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
              <InputField
                placeholder="Address"
                prefix={<HomeOutlined />}
                value={field.value}
                onChange={field.onChange}
                error={!!errors.address}
              />
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
            name="startTime"
            control={control}
            render={({ field }) => (
              <TimePickerCustom
                value={field.value}
                onChange={field.onChange}
                error={!!errors.startTime}
                placeholder="Start Time"
              />
            )}
          />
          {errors.startTime && (
            <p className="text-red-500 text-xs mt-1">
              {errors.startTime.message}
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-600 transition text-white px-6 py-2 rounded-lg font-light text-xl shadow mt-4 disabled:opacity-60"
        disabled={isSubmitting}
      >
        Add student
      </button>
    </form>
  );
}
