"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import {
  PiPackageFill,
  PiUsersFill,
  PiTruckFill,
  PiCubeFill,
  PiShoppingBagOpenFill,
  PiUserCircleFill,
  PiSparkleFill,
} from "react-icons/pi";

export default function AdminPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [bookCount, setBookCount] = useState(0);
  const [rentalCount, setRentalCount] = useState(0);
  const [borrowerCount, setBorrowerCount] = useState(0);

  // =======================
  // 管理者チェック
  // =======================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        router.push("/product_search");
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  // =======================
  // ダッシュボードデータ取得
  // =======================
  useEffect(() => {
    if (checkingAuth) return;

    const fetchDashboardData = async () => {
      try {
        // 登録商品数取得
        const booksSnapshot = await getDocs(collection(db, "books"));
        setBookCount(booksSnapshot.size);

        // 注文中の商品数取得
        const rentalsSnapshot = await getDocs(collection(db, "rentals"));

        const orderingBooks = rentalsSnapshot.docs.filter(
          (doc) => doc.data().status === "borrowed"
        );
        setRentalCount(orderingBooks.length);

        // 注文中の利用者数取得（userIdを重複なしで取得）
        const orderingUserIds = new Set(
          orderingBooks.map((doc) => doc.data().userId)
        );
        setBorrowerCount(orderingUserIds.size);
      } catch (error) {
        console.error("管理者情報取得失敗", error);
      }
    };

    fetchDashboardData();
  }, [checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-[#8B8377]">
          <PiSparkleFill className="h-4 w-4 animate-pulse" />
          確認中 ・ ・ ・
        </p>
      </main>
    );
  }

  const navItems = [
    {
      href: "/admin/books",
      icon: PiPackageFill,
      title: "商品管理",
      description: "商品の登録・編集・削除",
    },
    {
      href: "/admin/users",
      icon: PiUsersFill,
      title: "ユーザー管理",
      description: "利用者一覧・権限変更",
    },
    {
      href: "/admin/rentals",
      icon: PiTruckFill,
      title: "注文管理",
      description: "注文・発送管理",
    },
  ];

  const statItems = [
    {
      icon: PiCubeFill,
      label: "登録商品数",
      value: `${bookCount}点`,
      accent: "bg-[#EDE2E3] text-[#A9707A]",
    },
    {
      icon: PiShoppingBagOpenFill,
      label: "注文中",
      value: `${rentalCount}件`,
      accent: "bg-[#E1E7E2] text-[#6E9584]",
    },
    {
      icon: PiUserCircleFill,
      label: "利用者数",
      value: `${borrowerCount}人`,
      accent: "bg-[#EDE2C9] text-[#B08A45]",
    },
  ];

  return (
    <main className="mt-10 h-[800px] bg-gray-100 px-4 py-8 sm:ml-20 sm:px-6 lg:ml-64 lg:px-10 transition-all">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-2xl font-extrabold tracking-wide text-[#3F3A36] sm:text-3xl">
          管理者ダッシュボード
        </h1>

        {/* ナビゲーション */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navItems.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-[#8B7F94]/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-[#3F3A36]/70">
                <Icon className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#3F3A36]">
                {title}
              </h2>

              <p className="mt-1 text-sm text-[#3F3A36]/50">{description}</p>
            </Link>
          ))}
        </div>

        {/* 統計 */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statItems.map(({ icon: Icon, label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${accent}`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-sm font-bold text-[#3F3A36]/60">
                {label}
              </h2>

              <p className="mt-1 text-3xl font-extrabold text-[#3F3A36] sm:text-4xl">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}