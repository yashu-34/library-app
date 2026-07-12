"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  {
    name: "🏠 ダッシュボード",
    href: "/admin",
  },
  {
    name: "📚 本管理",
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

  return (
    <aside className="w-64 bg-blue-800 text-white min-h-screen">

      <div className="p-6 text-2xl font-bold border-b">
        📚 Library
      </div>

      <nav className="mt-5">

        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`block px-6 py-4 hover:bg-blue-700
            ${
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
  );
}