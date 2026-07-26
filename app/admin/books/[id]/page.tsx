"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";

import { Book } from "@/app/types/books";
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 権限確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.role === "admin") {
          setIsAdmin(true);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 商品取得
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookSnap = await getDoc(doc(db, "books", id));

        if (!bookSnap.exists()) {
          alert("商品が見つかりません");
          router.push("/admin");
          return;
        }

        setBook({
          id: bookSnap.id,
          ...(bookSnap.data() as Omit<Book, "id">),
        });
      } catch (error) {
        console.error(error);
        alert("取得失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, router]);

  // 削除
  const handleDelete = async () => {
    if (!isAdmin) {
      alert("管理者のみ削除できます");
      return;
    }

    if (!confirm("この商品を削除しますか？")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "books", id));
      router.push("/admin/books");
    } catch (error) {
      console.error(error);
      alert("削除失敗");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
        <p className="text-sm text-gray-400">よみこみ中 ・ ・ ・</p>
      </main>
    );
  }

  if (!book) {
    return null;
  }

  const fields = [
    { label: "タイトル", value: book.title },
    { label: "香り", value: book.author },
    { label: "説明", value: book.isbn },
    { label: "メーカー", value: book.publisher },
    { label: "発売日", value: book.publishDate },
    { label: "カテゴリ", value: book.category },
    { label: "在庫", value: `${book.stock}個` },
  ];

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/books"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          商品一覧へ戻る
        </Link>

        <h1 className="mb-8 border-b border-gray-200 pb-6 text-xl font-bold text-gray-900 sm:text-2xl">
          商品の詳細
        </h1>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* 画像 */}
          <div className="flex justify-center md:w-1/3 md:justify-start">
            {book.imageUrl ? (
              <Image
                src={book.imageUrl}
                alt={book.title}
                width={220}
                height={310}
                className="border border-gray-100 object-contain"
              />
            ) : (
              <div className="flex h-64 w-44 items-center justify-center border border-gray-100 bg-gray-50">
                <HiOutlinePhoto className="h-8 w-8 text-gray-300" />
              </div>
            )}
          </div>

          {/* 項目 */}
          <div className="flex-1">
            <dl className="divide-y divide-gray-100">
              {fields.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <dt className="w-20 shrink-0 text-xs font-semibold text-gray-400">
                    {label}
                  </dt>
                  <dd className="text-sm text-gray-900">{value || "-"}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* アクション */}
        <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          {isAdmin && (
            <>
              <Link
                href={`/admin/books/${id}/edit`}
                className="rounded-md bg-teal-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                編集する
              </Link>

              <button
                onClick={handleDelete}
                className="rounded-md border border-red-200 px-5 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                削除する
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}