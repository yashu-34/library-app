"use client";

import Link from "next/link";
import LogoutButton from "../auth/LogoutButton";

export default function UserHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8">

      <h1 className="text-2xl font-bold">
        📚 図書館貸出システム
      </h1>

      <nav className="flex gap-6">

        <Link href="/books">
          本一覧
        </Link>

        <Link href="/mypage">
          マイページ
        </Link>

      </nav>

      <LogoutButton />

    </header>
  );
}