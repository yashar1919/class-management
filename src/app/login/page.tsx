"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("userId", data.email); // یا هر آیدی یکتا
        window.location.href = "/class";
      } else {
        const data = await res.json();
        alert(data.error || "Login failed");
      }
    } catch (err) {
      console.log(err, "Signup error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 to-neutral-900">
      <form
        onSubmit={handleLogin}
        className="bg-neutral-950 p-8 rounded-xl shadow-lg w-full max-w-sm flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-teal-400 text-center">ورود</h2>
        <input
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-3 rounded bg-neutral-800 text-white"
          required
        />
        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-neutral-800 text-white"
          required
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 rounded transition"
        >
          ورود
        </button>
        <a href="/signup" className="text-teal-400 text-center hover:underline">
          ثبت‌نام نکرده‌اید؟
        </a>
      </form>
    </div>
  );
}
