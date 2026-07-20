"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, db } from "@/firebase/config";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";
import { useCart } from "@/components/user/CartProvider";

import {
  User as UserIcon,
  Search,
  ShoppingCart,
  BookOpen,
  Inbox,
  Book,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { GoHistory } from "react-icons/go";

interface User {
  name: string;
  email: string;
  address: string;
}

interface RecentRental {
  id: string;
  bookId: string;
  bookTitle: string;
  status: string;
  bookImage?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [recentRentals, setRecentRentals] = useState<RecentRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const { cart } = useCart();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();

          setUser({
            name: data.name ?? "未設定",
            email: currentUser.email ?? "",
            address: data.address ?? "未登録",
          });
        }

        // 直近の取り寄せ商品を3件取得
        const q = query(
          collection(db, "rentals"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(3)
        );

        const snapshot = await getDocs(q);

        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as RecentRental[];

        // 商品画像を books コレクションから補完
        const uniqueBookIds = Array.from(new Set(list.map((r) => r.bookId)));

        const imageEntries = await Promise.all(
          uniqueBookIds.map(async (bookId) => {
            try {
              const bookSnap = await getDoc(doc(db, "books", bookId));
              // フィールド名が異なる場合はここを実際の名前に変更してください
              const imageUrl = bookSnap.exists() ? bookSnap.data().imageUrl : undefined;
              return [bookId, imageUrl] as const;
            } catch {
              return [bookId, undefined] as const;
            }
          })
        );

        const imageMap = new Map(imageEntries);

        setRecentRentals(
          list.map((r) => ({ ...r, bookImage: imageMap.get(r.bookId) }))
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ログアウト
  const handleLogout = async () => {
    if (!confirm("ログアウトしますか？")) return;

    setLoggingOut(true);
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("ログアウトに失敗しました");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 lg:ml-72">
        <Sidebar />
        <main className="flex-1">
          <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
            {/* 読み込み中インジケーター */}
            <div className="mb-6 flex items-center gap-2 text-gray-500">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-sm font-medium">読み込み中...</span>
            </div>

            {/* 会員情報カードのスケルトン */}
            <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-lg">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xl bg-gray-50 p-5 ${i === 2 ? "md:col-span-2" : ""}`}
                  >
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* クイックアクションのスケルトン */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-5 sm:p-6 shadow-lg">
                  <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>

            {/* 最近の取り寄せのスケルトン */}
            <div className="mt-8 rounded-2xl bg-white p-5 sm:p-8 shadow-lg">
              <div className="mb-5 h-5 w-32 animate-pulse rounded bg-gray-200" />
              <div className="grid gap-4 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="h-20 w-14 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-16 animate-pulse rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl">
          <Header cartCount={cart.length} />

          <div className="mt-20 sm:mt-24 p-4 sm:p-6 lg:p-8 pt-0 space-y-6 sm:space-y-8">
            {/* 会員情報カード */}
            <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <UserIcon size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                      会員情報
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      登録されている情報です
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-gray-500">名前</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-black break-words">
                    {user?.name}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-gray-500">メール</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold break-all text-black">
                    {user?.email}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 sm:p-5 md:col-span-2">
                  <p className="text-xs sm:text-sm text-gray-500">住所</p>
                  <p className="mt-1 text-base sm:text-lg font-semibold text-black break-words">
                    {user?.address}
                  </p>
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <Link
                href="/product_search"
                className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <Search className="text-gray-700" size={26} />
                <p className="mt-3 font-bold text-gray-900 text-sm sm:text-base">
                  商品を探す
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-gray-500 group-hover:text-green-600">
                  一覧を見る <ArrowRight size={14} />
                </p>
              </Link>

              <Link
                href="/cart"
                className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <ShoppingCart className="text-gray-700" size={26} />
                <p className="mt-3 flex items-center gap-2 font-bold text-gray-900 text-sm sm:text-base">
                  カート
                  {cart.length > 0 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                      {cart.length}
                    </span>
                  )}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-gray-500 group-hover:text-green-600">
                  中身を確認 <ArrowRight size={14} />
                </p>
              </Link>

              <Link
                href="/rentals"
                className="group rounded-2xl bg-white p-5 sm:p-6 shadow-lg transition-shadow hover:shadow-xl"
              >
                <GoHistory className="text-gray-700" size={26} />
                <p className="mt-3 font-bold text-gray-900 text-sm sm:text-base">
                  取り寄せ履歴
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-gray-500 group-hover:text-green-600">
                  すべて見る <ArrowRight size={14} />
                </p>
              </Link>
            </div>

            {/* 最近の取り寄せ商品 */}
            <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base sm:text-xl font-bold text-gray-900">
                  最近の取り寄せ
                </h2>
                <Link
                  href="/rentals"
                  className="flex items-center gap-1 text-xs sm:text-sm font-bold text-green-600 hover:underline"
                >
                  すべて見る <ArrowRight size={14} />
                </Link>
              </div>

              {recentRentals.length === 0 ? (
                <div className="rounded-xl bg-gray-50 p-8 sm:p-10 text-center text-gray-400">
                  <Inbox className="mx-auto mb-2" size={30} />
                  <p className="text-sm">まだ取り寄せた商品がありません</p>
                  <Link
                    href="/product_search"
                    className="mt-4 inline-block rounded-lg bg-green-600 px-5 py-2 text-sm font-bold text-white hover:bg-green-700"
                  >
                    商品を探してみる
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  {recentRentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="flex gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                        {rental.bookImage ? (
                          <img
                            src={rental.bookImage}
                            alt={rental.bookTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <Book size={20} />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col justify-center min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {rental.bookTitle}
                        </p>
                        <span
                          className={`mt-1 w-fit rounded-full px-2 py-0.5 text-xs font-bold ${
                            rental.status === "borrowed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rental.status === "borrowed" ? "取り寄せ中" : "お届け済み"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}