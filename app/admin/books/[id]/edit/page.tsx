"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";

import ImageUploader from "@/components/common/ImageUploader";
import Image from "next/image";
import { HiOutlineArrowLeft } from "react-icons/hi2";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [book, setBook] = useState({
    title: "",
    author: "",
    isbn: "",
    publisher: "",
    publishDate: "",
    category: "",
    imageUrl: "",
    stock: 1,
  });

  // 管理者確認
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        alert("ユーザー情報がありません");
        router.push("/");
        return;
      }

      const userData = userSnap.data();

      if (userData.role !== "admin") {
        alert("管理者権限がありません");
        router.push("/");
        return;
      }

      setIsAdmin(true);
      fetchBook();
    });

    return () => unsubscribe();
  }, []);

  const fetchBook = async () => {
    try {
      const bookSnap = await getDoc(doc(db, "books", id));

      if (!bookSnap.exists()) {
        alert("商品がありません");
        router.push("/admin/books");
        return;
      }

      const data = bookSnap.data();

      setBook({
        title: data.title ?? "",
        author: data.author ?? "",
        isbn: data.isbn ?? "",
        publisher: data.publisher ?? "",
        publishDate: data.publishDate ?? "",
        category: data.category ?? "",
        imageUrl: data.imageUrl ?? "",
        stock: data.stock ?? 1,
      });
    } catch (error) {
      console.error(error);
      alert("取得失敗");
    } finally {
      setLoading(false);
    }
  };

  // 更新
  const updateBook = async () => {
    setErrorMessage("");

    if (!book.title.trim()) {
      setErrorMessage("タイトルを入力してください");
      return;
    }

    try {
      setSaving(true);

      let imageUrl = book.imageUrl;

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
          setSaving(false);
          return;
        }

        imageUrl = data.imageUrl;
      }

      await updateDoc(doc(db, "books", id), {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publisher: book.publisher,
        publishDate: book.publishDate,
        category: book.category,
        stock: Number(book.stock),
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/books");
    } catch (error) {
      console.error(error);
      setErrorMessage("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border-b border-gray-300 bg-transparent py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900";

  const labelClass = "mb-1.5 block text-xs font-semibold text-gray-500";

  if (loading || !isAdmin) {
    return (
      <main className="min-h-screen bg-white px-4 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
        <p className="text-sm text-gray-400">権限確認中 ・ ・ ・</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-20 sm:px-6 sm:pt-10 lg:pl-[calc(18rem+2.5rem)] lg:pr-10 lg:pt-10">
      <div className="max-w-4xl">
        <Link
          href="/admin/books"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <HiOutlineArrowLeft className="h-4 w-4" />
          商品一覧へ戻る
        </Link>

        <h1
          className="
            mb-8
            border-b
            border-gray-200
            pb-6
            text-xl
            font-bold
            text-gray-900
            sm:text-2xl
          "
        >
          商品を編集
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
            <label className={labelClass}>香り</label>
            <input
              className={inputClass}
              placeholder="香り"
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

          <div className="w-full sm:w-64">
            <label className={labelClass}>在庫数</label>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              className="
                w-full
                rounded-xl
                border
                border-gray-300
                bg-white
                px-4
                py-3
                text-lg
                font-semibold
                text-gray-900
                outline-none
                transition
                focus:border-teal-600
                focus:ring-2
                focus:ring-teal-100
              "
              value={book.stock === 0 ? "" : book.stock}
              onChange={(e) => {

                const value = e.target.value;

                // 空の場合
                if(value === ""){
                  setBook({
                    ...book,
                    stock: 0
                  });
                  return;
                }


                // 数字だけ許可
                const number =
                  Number(value.replace(/^0+/, ""));


                setBook({
                  ...book,
                  stock: number
                });

              }}
            />
          </div>

          <div>
            <label className={labelClass}>表紙画像</label>

            {book.imageUrl && (
              <div className="mb-3">
                <Image
                  src={book.imageUrl}
                  alt={book.title}
                  width={140}
                  height={195}
                  className="border border-gray-100 object-contain"
                />
              </div>
            )}

            <ImageUploader onSelectFile={(file) => setImageFile(file)} />
          </div>

          <button
            onClick={updateBook}
            disabled={saving}
            className="mt-4 w-full rounded-md bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-gray-300"
          >
            {saving ? "更新中..." : "更新する"}
          </button>
        </div>
      </div>
    </main>
  );
}