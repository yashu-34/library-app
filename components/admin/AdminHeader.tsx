"use client";

import LogoutButton from "../auth/LogoutButton";

export default function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">

      <h1 className="text-2xl font-bold text-black">
        管理者画面
      </h1>

      <LogoutButton />

    </header>
  );
}