"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

interface Rental {
  id: string;
  bookTitle: string;
  userName: string;
  borrowDate: string;
  returnDate: string;
  shippedDate?: string;
  status: string;
}

type SortOption =
  | "date_desc"
  | "pending_first"
  | "shipped_first"
  | "name"
  | "user";

const SORT_LABELS: Record<SortOption, string> = {
  date_desc: "注文日が新しい順",
  pending_first: "未発送",
  shipped_first: "発送済",
  name: "商品名順",
  user: "注文者順",
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");

  const [sortOption, setSortOption] =
    useState<SortOption>("date_desc");

  // ----------------------------
  // Firestore取得
  // ----------------------------
  const fetchRentals = async () => {
    try {
      const snapshot = await getDocs(
        collection(db, "rentals")
      );

      const list: Rental[] =
        snapshot.docs.map((docSnap) => {

          const data = docSnap.data();

          return {
            id: docSnap.id,
            bookTitle: data.bookTitle ?? "",
            userName: data.userName ?? "",
            borrowDate: data.borrowDate ?? "",
            returnDate: data.returnDate ?? "",
            shippedDate:
              data.shippedDate
                ? data.shippedDate
                    .toDate()
                    .toISOString()
                : "",
            status: data.status ?? "",
          };

        });
      setRentals(list);
    } catch (error) {
      console.error(error);
      alert("注文情報の取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  // ----------------------------
  // 発送済みに変更
  // ----------------------------
  const shipOrder = async (id: string) => {
    if (!confirm("発送済みにしますか？")) return;

    try {
      await updateDoc(doc(db, "rentals", id), {
        status: "returned",
        shippedDate: serverTimestamp(),
      });
      fetchRentals();
    } catch (error) {
      console.error(error);
      alert("更新に失敗しました。");
    }
  };

  // ----------------------------
  // 件数
  // ----------------------------
  const pendingCount = rentals.filter(
    (r) => r.status === "borrowed"
  ).length;

  const shippedCount = rentals.filter(
    (r) => r.status === "returned"
  ).length;

  // ----------------------------
  // 並び替え
  // ----------------------------
  const sortedRentals = useMemo(() => {
    const list = [...rentals];

    switch (sortOption) {

      case "date_desc":
        return list.sort(
          (a, b) =>
            new Date(b.borrowDate).getTime() -
            new Date(a.borrowDate).getTime()
        );

      case "pending_first":
        return list.sort((a, b) => {
          const aValue =
            a.status === "borrowed" ? 0 : 1;

          const bValue =
            b.status === "borrowed" ? 0 : 1;

          if (aValue !== bValue)
            return aValue - bValue;

          return (
            new Date(a.borrowDate).getTime() -
            new Date(b.borrowDate).getTime()
          );
        });

      case "shipped_first":
        return list.sort((a, b) => {
          const aValue =
            a.status === "returned" ? 0 : 1;

          const bValue =
            b.status === "returned" ? 0 : 1;

          if (aValue !== bValue)
            return aValue - bValue;

          return (
            new Date(a.borrowDate).getTime() -
            new Date(b.borrowDate).getTime()
          );
        });

      case "name":
        return list.sort((a, b) =>
          a.bookTitle.localeCompare(
            b.bookTitle,
            "ja"
          )
        );

      case "user":
        return list.sort((a, b) =>
          a.userName.localeCompare(
            b.userName,
            "ja"
          )
        );

      default:
        return list;
    }
  }, [rentals, sortOption]);

  // ----------------------------
  // 検索
  // ----------------------------
  const filteredRentals = useMemo(() => {

    return sortedRentals.filter((rental) => {

      const keywordLower =
        keyword.toLowerCase();


      // 検索条件
      const matchesKeyword =
        rental.bookTitle
          .toLowerCase()
          .includes(keywordLower) ||
        rental.userName
          .toLowerCase()
          .includes(keywordLower);



      // ステータス絞り込み
      let matchesStatus = true;


      if(sortOption === "pending_first"){

        matchesStatus =
          rental.status === "borrowed";

      }


      if(sortOption === "shipped_first"){

        matchesStatus =
          rental.status === "returned";

      }



      return (
        matchesKeyword &&
        matchesStatus
      );

    });

  }, [
    sortedRentals,
    keyword,
    sortOption
  ]);

  // ----------------------------
  // ステータスバッジ
  // ----------------------------
  const StatusBadge = ({
    status,
  }: {
    status: string;
  }) =>
    status === "borrowed" ? (
      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
        未発送
      </span>
    ) : (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
        発送済み
      </span>
    );

  return ( 
        <main className="min-h-screen bg-gray-50 px-4 pb-16 pt-20 sm:px-6 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
      <div className="mx-auto max-w-7xl">

        {/* タイトル */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            注文管理
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            全 {filteredRentals.length} 件
          </p>
        </div>

        {/* 件数カード */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">
              未発送
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">
              発送済み
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {shippedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs text-gray-500">
              合計注文
            </p>

            <p className="mt-2 text-3xl font-bold text-teal-700">
              {rentals.length}
            </p>
          </div>

        </div>

        {/* 検索・並び替え */}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row">

          <input
            type="text"
            placeholder="商品名・注文者で検索"
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            className="flex-1 rounded-lg border border-gray-500 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-600 text-gray-900"
          />

          <select
            value={sortOption}
            onChange={(e) =>
              setSortOption(
                e.target.value as SortOption
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-teal-600 text-gray-900"
          >
            {Object.entries(SORT_LABELS).map(
              ([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              )
            )}
          </select>

        </div>

        {loading ? (

          <div className="py-20 text-center text-gray-400">
            読み込み中・・・
          </div>

        ) : filteredRentals.length === 0 ? (

          <div className="rounded-xl border border-dashed bg-white py-20 text-center text-gray-400">
            注文はありません
          </div>

        ) : (

          <>

            {/* =======================
                PC テーブル
            ======================= */}

            <div className="hidden overflow-x-auto rounded-xl border bg-white shadow-sm md:block">

              <table className="min-w-full text-sm">

                <thead className="bg-gray-100">

                  <tr className="text-left text-gray-900">

                    <th className="px-5 py-4">
                      商品名
                    </th>

                    <th className="px-5 py-4">
                      注文者
                    </th>

                    <th className="px-5 py-4">
                      注文日
                    </th>

                    <th className="px-5 py-4">
                      発送日
                    </th>

                    <th className="px-5 py-4">
                      状態
                    </th>

                    <th className="px-5 py-4 text-center">
                      操作
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRentals.map(
                    (rental) => (

                      <tr
                        key={rental.id}
                        className="border-t transition hover:bg-gray-50"
                      >

                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {rental.bookTitle}
                        </td>

                        <td className="px-5 py-4 text-gray-900">
                          {rental.userName}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {rental.borrowDate}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {rental.status === "returned"
                            ? rental.shippedDate
                              ? new Date(
                                  rental.shippedDate
                                ).toLocaleDateString("ja-JP")
                              : "-"
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            status={rental.status}
                          />
                        </td>

                        <td className="px-5 py-4 text-center">

                          {rental.status ===
                            "borrowed" && (

                            <button
                              onClick={() =>
                                shipOrder(
                                  rental.id
                                )
                              }
                              className="rounded-lg bg-teal-700 px-5 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
                            >
                              発送済みにする
                            </button>

                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

            <div className="flex flex-col gap-4 md:hidden">

              {filteredRentals.map((rental) => (

                <div
                  key={rental.id}
                  className="rounded-xl border bg-white p-4 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <h2 className="text-base font-bold text-gray-900">
                        {rental.bookTitle}
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        {rental.userName}
                      </p>

                    </div>

                    <StatusBadge status={rental.status} />

                  </div>

                  <div className="mt-4 space-y-2 text-sm">

                    <div className="flex justify-between">

                      <span className="text-gray-500">
                        注文日
                      </span>

                      <span className="font-medium text-gray-800">
                        {rental.borrowDate}
                      </span>

                    </div>

                    <div className="flex justify-between">

                      <span className="text-gray-500">
                        発送予定日
                      </span>

                      <span className="font-medium text-gray-800">
                        {rental.returnDate}
                      </span>

                    </div>

                  </div>

                  {rental.status === "borrowed" && (

                    <button
                      onClick={() =>
                        shipOrder(rental.id)
                      }
                      className="mt-5 w-full rounded-lg bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-800 active:scale-[0.98]"
                    >
                      発送済みにする
                    </button>

                  )}

                </div>

              ))}

            </div>

          </>

        )}

      </div>

    </main>

  );
}