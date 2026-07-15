"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // スマホメニュー開閉
  const [menuOpen, setMenuOpen] = useState(false);

  // ログアウト
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("ログアウトに失敗しました");
    }
  };

  // メニュー一覧
  const menus = [
    {
      name: "ホーム",
      href: "/books",
      icon: "🏠",
    },
    {
      name: "貸出履歴",
      href: "/rentals",
      icon: "📖",
    },
    {
      name: "マイページ",
      href: "/profile",
      icon: "👤",
    },
    {
      name: "カート",
      href: "/cart",
      icon: "🛒",
    },
  ];

  return (
    <>
      {/* スマホ用ハンバーガーボタン */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-lg bg-amber-900 p-3 text-white shadow-lg"
        >
          ☰
        </button>
      </div>
            {/* PC用サイドバー */}
      <aside className="hidden min-h-screen w-72 flex-col bg-amber-900 text-white shadow-xl lg:flex">

        {/* ロゴ */}
        <div className="border-b border-amber-700 p-6">
          <h1 className="text-3xl font-bold">
            📚 Products
          </h1>

          <p className="mt-2 text-sm text-yellow-200">
            商品貸出システム
          </p>
        </div>

        {/* メニュー */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menus.map((menu) => (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                    pathname === menu.href
                      ? "bg-white font-bold text-amber-900"
                      : "hover:bg-amber-800"
                  }`}
                >
                  <span className="text-xl">{menu.icon}</span>
                  <span>{menu.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ログアウト */}
        <div className="mt-30 border-t border-amber-700 p-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold transition hover:bg-red-700"
          >
            🚪 ログアウト
          </button>
        </div>
      </aside>

      {/* スマホ用メニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">

          <div className="h-full w-72 bg-amber-900 text-white">

            <div className="flex items-center justify-between border-b border-amber-700 p-5">
              <h2 className="text-2xl font-bold">
                📚 Products
              </h2>

              <button
                onClick={() => setMenuOpen(false)}
                className="text-3xl"
              >
                ✕
              </button>
            </div>

            <nav className="p-4">
              <ul className="space-y-2">
                {menus.map((menu) => (
                  <li key={menu.href}>
                    <Link
                      href={menu.href}
                      onClick={() => setMenuOpen(false)}
                      className={`block rounded-xl px-4 py-3 transition ${
                        pathname === menu.href
                          ? "bg-white font-bold text-amber-900"
                          : "hover:bg-amber-800"
                      }`}
                    >
                      {menu.icon} {menu.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-amber-700 p-4">
              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-red-600 px-4 py-3 font-bold hover:bg-red-700"
              >
                🚪 ログアウト
              </button>
            </div>

          </div>

        </div>
      )}

    </>
  );
}