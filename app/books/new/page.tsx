"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";
import ImageUploader from "@/components/ImageUploader";

export default function NewBookPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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
          alert(data.message || "画像アップロードに失敗しました");
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

      alert("本を登録しました");

      router.push("/books");
    } catch (error) {
      console.error(error);
      alert("登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-3xl font-bold">
        📚 本を登録
      </h1>

      <div className="space-y-4">

        <input
          className="w-full rounded border p-3"
          placeholder="タイトル"
          value={book.title}
          onChange={(e) =>
            setBook({
              ...book,
              title: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded border p-3"
          placeholder="著者"
          value={book.author}
          onChange={(e) =>
            setBook({
              ...book,
              author: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded border p-3"
          placeholder="ISBN"
          value={book.isbn}
          onChange={(e) =>
            setBook({
              ...book,
              isbn: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded border p-3"
          placeholder="出版社"
          value={book.publisher}
          onChange={(e) =>
            setBook({
              ...book,
              publisher: e.target.value,
            })
          }
        />

        <input
          type="date"
          className="w-full rounded border p-3"
          value={book.publishDate}
          onChange={(e) =>
            setBook({
              ...book,
              publishDate: e.target.value,
            })
          }
        />

        <input
          className="w-full rounded border p-3"
          placeholder="カテゴリ"
          value={book.category}
          onChange={(e) =>
            setBook({
              ...book,
              category: e.target.value,
            })
          }
        />

        <input
          type="number"
          min={0}
          className="w-full rounded border p-3"
          value={book.stock}
          onChange={(e) =>
            setBook({
              ...book,
              stock: Number(e.target.value),
            })
          }
        />

        <div>
          <label className="mb-2 block font-semibold">
            表紙画像
          </label>

          <ImageUploader
            onSelectFile={(file) => setImageFile(file)}
          />
        </div>

        <button
          onClick={saveBook}
          disabled={loading}
          className="w-full rounded bg-green-600 p-3 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "登録中..." : "登録"}
        </button>

      </div>
    </main>
  );
}