"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Book } from "@/app/types/books";
import Link from "next/link";
import Image from "next/image";

import {
  HiOutlineArchiveBox,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePhoto,
  HiOutlineSparkles,
} from "react-icons/hi2";

type BookWithId = Book & { id: string };

export default function BooksPage() {
  const [books, setBooks] = useState<BookWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const snapshot = await getDocs(collection(db, "books"));

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BookWithId[];

        setBooks(data);
      } catch (error) {
        console.error("商品情報取得失敗", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // カテゴリ一覧（重複なし）
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(books.map((book) => book.category).filter(Boolean))
    );
    return unique;
  }, [books]);

  // 検索・カテゴリ絞り込み
  const filteredBooks = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;

      const matchesKeyword =
        keyword === "" ||
        book.title?.toLowerCase().includes(keyword) ||
        book.author?.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [books, searchTerm, selectedCategory]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 pb-10 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
      <div className="mx-auto max-w-6xl">
        {/* ヘッダー */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-wide text-gray-900 sm:text-3xl">
            <HiOutlineArchiveBox className="h-7 w-7 text-teal-700" />
            商品一覧
          </h1>

          <Link
            href="/admin/books/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
          >
            <HiOutlinePlus className="h-4 w-4" />
            新規登録
          </Link>
        </div>

        {/* 検索・絞り込み */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="商品名・販売名で検索"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-sm font-semibold text-gray-700 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100 sm:w-56"
          >
            <option value="all">すべてのカテゴリ</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* 件数表示 */}
        {!loading && (
          <p className="mb-4 text-sm font-semibold text-gray-500">
            {filteredBooks.length}件の商品
          </p>
        )}

        {/* ローディング */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <p className="flex items-center gap-2 text-sm font-bold text-teal-700">
              <HiOutlineSparkles className="h-4 w-4 animate-pulse" />
              よみこみ中 ・ ・ ・
            </p>
          </div>
        )}

        {/* 商品なし */}
        {!loading && filteredBooks.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
            <HiOutlineArchiveBox className="h-8 w-8 text-gray-300" />
            <p className="text-sm font-bold text-gray-500">
              条件に一致する商品が見つかりません
            </p>
          </div>
        )}

        {/* 商品一覧 */}
        {!loading && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* 画像 */}
                <div className="flex h-48 items-center justify-center bg-gray-50 p-4">
                  {book.imageUrl ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={book.imageUrl}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-300">
                      <HiOutlinePhoto className="h-10 w-10" />
                      <span className="text-xs font-bold">No Image</span>
                    </div>
                  )}
                </div>

                {/* 詳細 */}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {book.category && (
                    <span className="inline-flex w-fit items-center rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                      {book.category}
                    </span>
                  )}

                  <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
                    {book.title}
                  </h2>

                  <dl className="mt-1 space-y-1 text-xs text-gray-500">
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0">販売名</dt>
                      <dd className="truncate text-right font-semibold text-gray-700">
                        {book.author}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0">発売日</dt>
                      <dd className="text-right font-semibold text-gray-700">
                        {book.publishDate}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="shrink-0">在庫</dt>
                      <dd
                        className={`text-right font-semibold ${
                          book.stock > 0 ? "text-gray-700" : "text-red-500"
                        }`}
                      >
                        {book.stock > 0 ? `${book.stock}個` : "品切れ"}
                      </dd>
                    </div>
                  </dl>

                  {/* アクション */}
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link
                      href={`/admin/books/${book.id}`}
                      className="flex-1 rounded-full border border-gray-200 py-2 text-center text-sm font-bold text-gray-700 transition hover:border-teal-600 hover:text-teal-700"
                    >
                      詳細
                    </Link>

                    <Link
                      href={`/admin/books/${book.id}/edit`}
                      className="flex-1 rounded-full bg-teal-700 py-2 text-center text-sm font-bold text-white transition hover:bg-teal-800"
                    >
                      編集
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}