"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import { Book } from "@/app/types/books";

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          alert("本が見つかりません");
          router.push("/books");
          return;
        }

        setBook({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Book, "id">),
        });
      } catch (error) {
        console.error(error);
        alert("本の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("この本を削除しますか？")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "books", id));

      alert("削除しました");

      router.push("/books");
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <main className="p-8">
        <p>読み込み中...</p>
      </main>
    );
  }

  if (!book) return null;

  return (
    <main className="mx-auto max-w-4xl p-8">

      <h1 className="mb-8 text-3xl font-bold">
        📚 本の詳細
      </h1>

      <div className="rounded-lg border bg-white p-6 shadow">

        <div className="flex flex-col gap-8 md:flex-row">

          <div className="flex justify-center md:w-1/3">
            <Image
              src={book.imageUrl || "/images/no-image.png"}
              alt={book.title}
              width={250}
              height={350}
              className="rounded-lg border object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">

            <div>
              <p className="font-bold">タイトル</p>
              <p>{book.title}</p>
            </div>

            <div>
              <p className="font-bold">著者</p>
              <p>{book.author}</p>
            </div>

            <div>
              <p className="font-bold">ISBN</p>
              <p>{book.isbn}</p>
            </div>

            <div>
              <p className="font-bold">出版社</p>
              <p>{book.publisher}</p>
            </div>

            <div>
              <p className="font-bold">出版日</p>
              <p>{book.publishDate}</p>
            </div>

            <div>
              <p className="font-bold">カテゴリ</p>
              <p>{book.category}</p>
            </div>

            <div>
              <p className="font-bold">在庫</p>
              <p>{book.stock} 冊</p>
            </div>

          </div>

        </div>

        <div className="mt-10 flex flex-wrap gap-3">

          <Link
            href={`/books/${id}/edit`}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            ✏️ 編集
          </Link>

          <button
            onClick={handleDelete}
            className="rounded bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            🗑️ 削除
          </button>

          <Link
            href="/books"
            className="rounded bg-gray-600 px-5 py-2 text-white hover:bg-gray-700"
          >
            ← 一覧へ戻る
          </Link>

        </div>

      </div>

    </main>
  );
}