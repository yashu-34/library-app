"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import ImageUploader from "@/components/common/ImageUploader";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function NewBookPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ImageUploaderから受け取る画像ファイル
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [book, setBook] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishDate: "",
    category: "",
    stock: 1,
  });

  const saveBook = async () => {
    setErrorMessage("");

    if (!book.title.trim()) {
      setErrorMessage("タイトルを入力してください");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      // 画像が選択されていたらCloudinaryへアップロード
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "画像アップロードに失敗しました");
          setLoading(false);
          return;
        }

        imageUrl = data.imageUrl;
      }

      // Firestoreへ保存
      await addDoc(collection(db, "books"), {
        ...book,
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/books");
    } catch (error) {
      console.error(error);
      setErrorMessage("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-500";

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/admin/books"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          商品一覧へ戻る
        </Link>

        <h1 className="mb-8 border-b border-gray-200 pb-6 text-xl font-bold text-gray-900 sm:text-2xl">
          商品を登録
        </h1>

        {errorMessage && (
          <div className="mb-6 border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className={labelClass}>タイトル</label>
            <input
              className={inputClass}
              placeholder="商品のタイトル"
              value={book.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>販売名</label>
            <input
              className={inputClass}
              placeholder="販売名"
              value={book.author}
              onChange={(e) => setBook({ ...book, author: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass}>説明</label>
            <input
              className={inputClass}
              placeholder="商品の説明"
              value={book.isbn}
              onChange={(e) => setBook({ ...book, isbn: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>発売日</label>
              <input
                type="date"
                className={inputClass}
                value={book.publishDate}
                onChange={(e) =>
                  setBook({ ...book, publishDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className={labelClass}>カテゴリ</label>
              <input
                className={inputClass}
                placeholder="カテゴリ"
                value={book.category}
                onChange={(e) =>
                  setBook({ ...book, category: e.target.value })
                }
              />
            </div>
          </div>

          <div className="max-w-[10rem]">
            <label className={labelClass}>在庫数</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={book.stock}
              onChange={(e) =>
                setBook({ ...book, stock: Number(e.target.value) })
              }
            />
          </div>

          <div>
            <label className={labelClass}>表紙画像</label>
            <ImageUploader onSelectFile={(file) => setImageFile(file)} />
          </div>

          <button
            onClick={saveBook}
            disabled={loading}
            className="mt-4 w-full rounded-md bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-gray-300"
          >
            {loading ? "登録中..." : "登録する"}
          </button>
        </div>
      </div>
    </main>
  );
}