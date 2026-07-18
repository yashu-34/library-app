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
  <div className="mx-auto flex h-20 max-w-11xl items-center justify-between px-4 lg:px-8">

    {/* 左側 */}
    <div className="flex items-center gap-3">

      {/* Sidebar.tsx のハンバーガーボタンと重ならないようにスマホだけ余白 */}
      <div className="pl-12 lg:pl-0 flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70">
          <FaBoxOpen className="text-lg text-teal-700" />
        </div>

        <div>
          <h1 className="text-[#505050] text-base font-bold tracking-wide sm:text-xl">
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
        items-center
        gap-2
        rounded-full
        bg-white
        px-4
        py-2
        text-sm
        font-semibold
        text-teal-700
        transition
        hover:bg-gray-50
      "
    >
      <HiOutlineShoppingCart className="text-lg"/>

      <span>カート</span>

      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-xs text-white">
        {cartCount}
      </span>
    </Link>

  </div>
</header>

);

}