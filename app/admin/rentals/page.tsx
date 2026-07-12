"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

interface Rental {
  id: string;
  bookTitle: string;
  userName: string;
  borrowDate: string;
  returnDate: string;
  status: string;
}

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);

  const fetchRentals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "rentals"));

      const list: Rental[] = snapshot.docs.map((rentalDoc) => ({
        id: rentalDoc.id,
        ...(rentalDoc.data() as Omit<Rental, "id">),
      }));

      setRentals(list);
    } catch (error) {
      console.error(error);
      alert("貸出情報の取得に失敗しました。");
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const returnBook = async (id: string) => {
    if (!confirm("この本を返却しますか？")) return;

    try {
      await updateDoc(doc(db, "rentals", id), {
        status: "returned",
      });

      alert("返却しました。");
      fetchRentals();
    } catch (error) {
      console.error(error);
      alert("返却に失敗しました。");
    }
  };

  return (
    <main className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        📖 貸出管理
      </h1>

      <table className="w-full overflow-hidden rounded-lg border border-gray-300 shadow">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="border p-3">本</th>
            <th className="border p-3">利用者</th>
            <th className="border p-3">貸出日</th>
            <th className="border p-3">返却予定日</th>
            <th className="border p-3">状態</th>
            <th className="border p-3">操作</th>
          </tr>
        </thead>

        <tbody>
          {rentals.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="p-8 text-center text-gray-500"
              >
                貸出データがありません
              </td>
            </tr>
          ) : (
            rentals.map((rental) => (
              <tr
                key={rental.id}
                className="hover:bg-gray-100"
              >
                <td className="border p-3 text-gray-900">
                  {rental.bookTitle}
                </td>

                <td className="border p-3 text-gray-900">
                  {rental.userName}
                </td>

                <td className="border p-3 text-gray-900">
                  {rental.borrowDate}
                </td>

                <td className="border p-3 text-gray-900">
                  {rental.returnDate}
                </td>

                <td className="border p-3">
                  {rental.status === "borrowed" ? (
                    <span className="rounded bg-yellow-100 px-3 py-1 text-yellow-700">
                      貸出中
                    </span>
                  ) : (
                    <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                      返却済
                    </span>
                  )}
                </td>

                <td className="border p-3">
                  {rental.status === "borrowed" && (
                    <button
                      onClick={() => returnBook(rental.id)}
                      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      返却
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </main>
  );
}