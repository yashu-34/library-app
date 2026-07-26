"use client";

import LogoutButton from "../auth/LogoutButton";
import { PiPackageFill } from "react-icons/pi";

export default function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 hidden h-20 items-center justify-between border-b border-gray-200 bg-white px-8 md:flex">
      <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-wide text-[#3F3A36]">
        <PiPackageFill className="h-5 w-5 text-[#A9707A]" />
        管理者画面
      </h1>

      <LogoutButton />
    </header>
  );
}