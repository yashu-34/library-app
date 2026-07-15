"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Book } from "@/app/types/books";
import Link from "next/link";
import Image from "next/image";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const snapshot = await getDocs(collection(db, "books"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Book[];

      setBooks(data);
    };

    fetchBooks();
  }, []);

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">📚 商品一覧</h1>

        <Link
          href="/admin/books/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          新規登録
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <div
            key={book.id}
            className="rounded-lg border bg-white p-4 shadow"
          >
            <div className="mb-4 flex justify-center">
              <Image
                src={book.imageUrl}
                alt={book.title}
                width={150}
                height={220}
                className="rounded object-cover"
              />
            </div>

          <div className="text-black">

            <h2 className="text-xl font-bold">{book.title}</h2>

            <p>販売名：{book.author}</p>

            <p>発売日：{book.publishDate}</p>

            <p>カテゴリ：{book.category}</p>

            <p>在庫：{book.stock}個</p>

          </div>

            <div className="mt-4 flex gap-3">
              <Link
                href={`/admin/books/${book.id}`}
                className="text-blue-600 hover:underline"
              >
                詳細
              </Link>

              <Link
                href={`/admin/books/${book.id}/edit`}
                className="text-green-600 hover:underline"
              >
                編集
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}