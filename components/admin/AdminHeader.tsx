"use client";

import { PiPackageFill } from "react-icons/pi";

export default function AdminHeader() {
  return (
    <header
      className="
        fixed
        top-0
        left-0
        right-0
        z-50
        flex
        h-16
        items-center
        justify-between
        border-b
        border-gray-200
        bg-white
        px-8
        shadow-sm
      "
    >
      <h1 className="ml-5 flex items-center gap-2 text-xl font-extrabold tracking-wide text-[#3F3A36]">
        <PiPackageFill className="h-5 w-5 text-[#A9707A]" />
        管理者画面
      </h1>
    </header>
  );
}