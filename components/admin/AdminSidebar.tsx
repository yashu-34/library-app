"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    name: "🏠 ダッシュボード",
    href: "/admin",
  },
  {
    name: "📚 商品管理",
    href: "/admin/books",
  },
  {
    name: "👤 ユーザー管理",
    href: "/admin/users",
  },
  {
    name: "📖 貸出管理",
    href: "/admin/rentals",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* スマホ用ヘッダー */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-blue-800 p-4 text-white md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="text-3xl"
        >
          ☰
        </button>

        <h1 className="text-xl font-bold">
          📚 管理画面
        </h1>

        <div className="w-8" />
      </header>

      {/* 背景 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          h-screen
          w-64
          bg-blue-800
          text-white
          transform
          transition-transform
          duration-300

          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:translate-x-0
          md:static
          md:block
        `}
      >
        <div className="flex items-top justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            📚 商品管理
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="text-2xl md:hidden"
          >
            ✕
          </button>
        </div>

        <nav className="mt-5">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              onClick={() => setOpen(false)}
              className={`block px-6 py-4 transition hover:bg-blue-700 ${
                pathname === menu.href
                  ? "bg-blue-600"
                  : ""
              }`}
            >
              {menu.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}