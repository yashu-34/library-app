"use client";

import Link from "next/link";

import {
  FaBoxOpen,
} from "react-icons/fa";

import {
  HiOutlineShoppingCart,
} from "react-icons/hi";

interface HeaderProps {
  cartCount: number;
}

export default function Header({ cartCount }: HeaderProps) {

  return(

<header
  className="
    fixed
    top-0
    left-0
    right-0
    z-40
    bg-[#7FFFD4]
    text-gray-900
    border-b
    border-[#5EDFC0]
  "
>
  <div className="mx-auto flex h-16 sm:h-20 max-w-11xl items-center justify-between px-3 sm:px-4 lg:px-8">

    {/* 左側 */}
    <div className="flex items-center gap-2 sm:gap-3 min-w-0">

      {/* Sidebar.tsx のハンバーガーボタンと重ならないようにスマホだけ余白 */}
      <div className="pl-10 sm:pl-12 lg:pl-0 flex items-center gap-2 sm:gap-3 min-w-0">

        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-white/70">
          <FaBoxOpen className="text-sm sm:text-lg text-teal-700" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-wide text-[#505050] sm:text-base lg:text-xl">
            サンプル取り寄せ
          </h1>

          <p className="hidden text-[11px] tracking-wide text-gray-700 sm:block">
            商品の検索・取り寄せ・在庫確認ができます
          </p>
        </div>

      </div>

    </div>

    {/* 右側 */}
    <Link
      href="/cart"
      className="
        flex
        shrink-0
        items-center
        gap-1
        sm:gap-2
        rounded-full
        bg-white
        px-2.5
        py-1.5
        sm:px-4
        sm:py-2
        text-xs
        sm:text-sm
        font-semibold
        text-teal-700
        transition
        hover:bg-gray-50
      "
    >
      <HiOutlineShoppingCart className="text-base sm:text-lg"/>

      <span className="hidden sm:inline">カート</span>

      <span className="flex h-4 w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] sm:text-xs text-white">
        {cartCount}
      </span>
    </Link>

  </div>
</header>

);

}