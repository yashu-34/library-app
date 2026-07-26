"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

import {
  HiOutlineHome,
  HiOutlineArchiveBox,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

  // スマホでメニューを開いている間は背後のスクロールを止める
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("ログアウトに失敗しました");
    }
  };

  const menus = [
    {
      name: "ダッシュボード",
      href: "/admin",
      icon: <HiOutlineHome size={22} />,
    },
    {
      name: "商品管理",
      href: "/admin/books",
      icon: <HiOutlineArchiveBox size={22} />,
    },
    {
      name: "ユーザー管理",
      href: "/admin/users",
      icon: <HiOutlineUsers size={22} />,
    },
    {
      name: "注文管理",
      href: "/admin/rentals",
      icon: <HiOutlineTruck size={22} />,
    },
  ];

  return (
    <>
      {/* スマホ用メニューボタン */}
      {!menuOpen && (
        <div className="fixed left-2 top-4 sm:left-3 sm:top-6 z-[100] lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-full bg-teal-700 p-1.5 sm:p-2 text-white shadow-sm transition hover:bg-teal-800"
            aria-label="メニューを開く"
          >
            <HiOutlineBars3 size={14} className="sm:hidden" />
            <HiOutlineBars3 size={18} className="hidden sm:block" />
          </button>
        </div>
      )}

      {/* PCサイドバー */}
      <aside className="
        hidden
        fixed
        left-0
        top-16
        z-40
        h-[calc(100vh-4rem)]
        w-72
        flex-col
        overflow-y-auto
        overflow-x-hidden
        bg-[#AFEEEE]
        text-gray-900
        lg:flex
      ">
        {/* メニュー */}
        <nav className="flex-1 p-4 text-[#505050]">
          <ul className="space-y-2">
            {menus.map((menu) => (
              <li key={menu.href}>
                <Link
                  href={menu.href}
                  className={`
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    duration-300

                    ${
                      pathname === menu.href
                        ? "bg-white text-teal-700 shadow-sm"
                        : "text-gray-800 hover:bg-white/40"
                    }
                  `}
                >
                  {menu.icon}
                  <span>{menu.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ログアウト */}
        <div className="flex w-72 flex-col pb-6">
          <button
            onClick={handleLogout}
            className="
              mb-10
              mx-auto
              flex
              w-44
              items-center
              justify-center
              gap-2
              rounded-full
              bg-white
              px-3
              py-2.5
              text-sm
              font-semibold
              text-red-500
              transition
              hover:bg-red-50
            "
          >
            <HiOutlineArrowLeftOnRectangle size={20} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* スマホメニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 lg:hidden">
          <div
            className="
              h-full
              w-72
              max-w-[80vw]
              flex
              flex-col
              overflow-y-auto
              bg-[#AFEEEE]
              text-gray-900
            "
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-[#5EDFC0] p-5">
              <div>
                <h2 className="text-xl font-bold tracking-wide">
                  管理画面
                </h2>

                <p className="text-xs text-gray-700">
                  商品・ユーザー・注文の管理ができます。
                </p>
              </div>

              <button onClick={() => setMenuOpen(false)} aria-label="メニューを閉じる">
                <HiOutlineXMark size={28} />
              </button>
            </div>

            {/* メニュー */}
            <nav className="p-4">
              <ul className="space-y-2">
                {menus.map((menu) => (
                  <li key={menu.href}>
                    <Link
                      href={menu.href}
                      onClick={() => setMenuOpen(false)}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        transition-all

                        ${
                          pathname === menu.href
                            ? "bg-white text-teal-700 shadow-sm"
                            : "text-gray-800 hover:bg-white/40"
                        }
                      `}
                    >
                      {menu.icon}
                      {menu.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ログアウト */}
            <div className="mt-auto flex w-full flex-col pb-6">
              <button
                onClick={handleLogout}
                className="
                  mx-auto
                  flex
                  w-44
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  font-semibold
                  text-red-500
                  transition
                  hover:bg-red-50
                  "
              >
                <HiOutlineArrowLeftOnRectangle size={18} />
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}