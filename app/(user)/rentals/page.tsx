"use client";

import Sidebar from "@/components/common/Sidebar";
import { useEffect, useMemo, useState } from "react";

import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

import { db } from "@/firebase/config";

import Header from "@/components/common/Header";
import { useCart } from "@/components/user/CartProvider";

interface Rental {
  id: string;
  bookId: string;
  bookTitle: string;
  borrowDate: string;
  returnDate?: string;
  status: string;
  bookImage?: string; // books コレクションから補完
}

export default function MyRentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"borrowed" | "returned">("borrowed");
  const [search, setSearch] = useState("");

  const { cart } = useCart();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      setLoading(true);

      const q = query(collection(db, "rentals"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Rental[];

      // 商品画像を books コレクションから取得して結合(bookId の重複はまとめて取得)
      const uniqueBookIds = Array.from(new Set(list.map((r) => r.bookId)));

      const imageEntries = await Promise.all(
        uniqueBookIds.map(async (bookId) => {
          try {
            const bookSnap = await getDoc(doc(db, "books", bookId));
            // 実際のフィールド名が異なる場合はここを変更してください（例: coverUrl, thumbnail など）
            const imageUrl = bookSnap.exists() ? bookSnap.data().imageUrl : undefined;
            return [bookId, imageUrl] as const;
          } catch {
            return [bookId, undefined] as const;
          }
        })
      );

      const imageMap = new Map(imageEntries);

      const enriched = list.map((r) => ({
        ...r,
        bookImage: imageMap.get(r.bookId),
      }));

      setRentals(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const borrowedCount = useMemo(
    () => rentals.filter((r) => r.status === "borrowed").length,
    [rentals]
  );
  const returnedCount = useMemo(
    () => rentals.filter((r) => r.status === "returned").length,
    [rentals]
  );

  const displayRentals = useMemo(() => {
    return rentals
      .filter((rental) => rental.status === tab)
      .filter((rental) => {
        if (!search.trim()) return true;
        return rental.bookTitle.toLowerCase().includes(search.trim().toLowerCase());
      });
  }, [rentals, tab, search]);

  return (
    <div className="flex min-h-screen bg-gray-50 lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <Header cartCount={cart.length} />

        <div className="p-6 lg:p-8 mt-20 max-w-3xl mx-auto">
          {/* ページタイトル */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">取り寄せ履歴</h1>
            <p className="mt-1 text-sm text-gray-500">
              あなたが取り寄せた商品の一覧です
            </p>
          </div>

          {/* タブ + 検索 */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setTab("borrowed")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  tab === "borrowed"
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                取り寄せ中
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tab === "borrowed" ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {borrowedCount}
                </span>
              </button>

              <button
                onClick={() => setTab("returned")}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
                  tab === "returned"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                お届け済み
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tab === "returned" ? "bg-white/20" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {returnedCount}
                </span>
              </button>
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="商品名で検索"
              className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:w-64"
            />
          </div>

          {/* 商品カード一覧 */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : displayRentals.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-gray-400 shadow-sm border border-gray-100">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">
                {search ? "該当する商品が見つかりません" : "データがありません"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
                >
                  {/* 画像（左） */}
                  <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {rental.bookImage ? (
                      <img
                        src={rental.bookImage}
                        alt={rental.bookTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        📚
                      </div>
                    )}
                  </div>

                  {/* 詳細（右） */}
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="font-bold text-gray-900 leading-snug">
                      {rental.bookTitle}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      取り寄せ日: {rental.borrowDate}
                    </p>

                    <div className="mt-2">
                      {rental.status === "borrowed" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          取り寄せ中
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                          お届け済み
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}