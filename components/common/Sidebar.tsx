"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";

import {
  HiOutlineHome,
  HiOutlineClipboardDocumentList,
  HiOutlineUser,
  HiOutlineShoppingCart,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";

import { AiFillAlert } from "react-icons/ai";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);

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
      name: "ホーム",
      href: "/product_search",
      icon: <HiOutlineHome size={22} />,
    },
    {
      name: "履歴",
      href: "/rentals",
      icon: <HiOutlineClipboardDocumentList size={22} />,
    },
    {
      name: "マイページ",
      href: "/profile",
      icon: <HiOutlineUser size={22} />,
    },
    {
      name: "カート",
      href: "/cart",
      icon: <HiOutlineShoppingCart size={22} />,
    },
  ];

  return (
    <>
      {/* スマホ用メニューボタン */}
      <div className="fixed left-3 top-6 z-50 lg:hidden">
        <button
          onClick={() => setMenuOpen(true)}
          className="rounded-full bg-teal-700 p-3 text-white shadow-sm transition hover:bg-teal-800"
        >
          <HiOutlineBars3 size={24} />
        </button>
      </div>

      {/* PCサイドバー */}
      <aside className="hidden fixed left-0 top-20 z-40 h-[calc(100vh-5rem)] w-72 flex-col bg-[#20B2AA] text-gray-900 border-r border-[#5EDFC0] lg:flex">
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

        {/* サービス利用と注意点 */}
        <div className="mx-4 mb-4 rounded-xl bg-white/50 p-4 text-sm">
          <h3 className="flex mb-3 items-center justify-center gap-1 border-b border-white/60 pb-2 text-sm font-bold text-[#505050]">
            <AiFillAlert className="text-teal-700" /> サービス利用と注意点
          </h3>

          <ul className="space-y-2 text-xs leading-5 text-gray-700">
            <li>• 本サービスは、本店舗限定のサービスです。</li>
            <li>• サンプルはお一人様1商品1回分です。</li>
            <li>• 一度にお申込みいただける数量は5包までです。</li>
            <li>• 商品や在庫状況により、ご希望のサンプルをご用意できない場合があります。</li>
            <li>• サンプルのお届けには日数がかかる場合があります。</li>
            <li>• サンプルの転売・譲渡・商用利用はご遠慮ください。</li>
            <li>• パッケージや仕様は販売商品と異なる場合があります。</li>
            <li>• 使用中・使用後に異常を感じた場合は直ちに使用を中止してください。</li>
            <li>• 乳幼児の手の届かない場所で保管してください。</li>
          </ul>
        </div>

        {/* ログアウト */}
        <div className="flex h-full w-72 flex-col pb-6">
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
            <HiOutlineArrowLeftOnRectangle size={20} />
            ログアウト
          </button>
        </div>
      </aside>

      {/* スマホメニュー */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div
            className="
              h-full
              w-72
              bg-[#7FFFD4]
              text-gray-900
            "
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between border-b border-[#5EDFC0] p-5">
              <div>
                <h2 className="text-xl font-bold tracking-wide">
                  サンプル取り寄せ
                </h2>

                <p className="text-xs text-gray-700">
                  商品の検索・取り寄せ・在庫確認ができます。
                </p>
              </div>

              <button onClick={() => setMenuOpen(false)}>
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

            {/* サービス利用と注意点 */}
            <div className="
            mx-4
            mb-4
            rounded-xl
            bg-white/50
            p-4
            text-sm
            max-h-56
            overflow-y-auto
            lg:max-h-none
            lg:overflow-visible
            ">
              <h3 className="flex mb-3 items-center justify-center gap-1 border-b border-white/60 pb-2 text-sm font-bold text-gray-900">
                <AiFillAlert className="text-teal-700" /> サービス利用と注意点
              </h3>

              <ul className="space-y-2 text-xs leading-5 text-gray-700">
                <li>• 本サービスは、本店舗限定のサービスです。</li>
                <li>• サンプルはお一人様1商品1回分です。</li>
                <li>• 一度にお申込みいただける数量は5包までです。</li>
                <li>• 商品や在庫状況により、ご希望のサンプルをご用意できない場合があります。</li>
                <li>• サンプルのお届けには日数がかかる場合があります。</li>
                <li>• サンプルの転売・譲渡・商用利用はご遠慮ください。</li>
                <li>• パッケージや仕様は販売商品と異なる場合があります。</li>
                <li>• 使用中・使用後に異常を感じた場合は直ちに使用を中止してください。</li>
                <li>• 乳幼児の手の届かない場所で保管してください。</li>
              </ul>
            </div>

            {/* ログアウト */}
            <div className="flex h-full w-72 flex-col pb-6">
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
                  ">
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