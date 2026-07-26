"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiHouseFill,
  PiPackageFill,
  PiUsersFill,
  PiTruckFill,
  PiListBold,
  PiXBold,
} from "react-icons/pi";

const menus = [
  {
    name: "ダッシュボード",
    href: "/admin",
    icon: PiHouseFill,
  },
  {
    name: "商品管理",
    href: "/admin/books",
    icon: PiPackageFill,
  },
  {
    name: "ユーザー管理",
    href: "/admin/users",
    icon: PiUsersFill,
  },
  {
    name: "注文管理",
    href: "/admin/rentals",
    icon: PiTruckFill,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* スマホ用ヘッダー */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#3F3A36] transition hover:bg-gray-100"
          aria-label="メニューを開く"
        >
          <PiListBold className="h-5 w-5" />
        </button>

        <h1 className="flex items-center gap-2 text-base font-bold text-[#3F3A36]">
          <PiPackageFill className="h-5 w-5 text-[#A9707A]" />
          管理画面
        </h1>

        <div className="w-9" />
      </header>

      {/* 背景 */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#3F3A36]/35 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          border-r border-gray-200 bg-white
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#3F3A36]">
            <PiPackageFill className="h-5 w-5 text-[#A9707A]" />
            商品管理
          </h2>

          <button
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#3F3A36]/60 transition hover:bg-gray-100 md:hidden"
            aria-label="メニューを閉じる"
          >
            <PiXBold className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-3 flex flex-col gap-1 px-3">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-[#EDE2E3] text-[#A9707A]"
                    : "text-[#3F3A36]/70 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                {menu.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}