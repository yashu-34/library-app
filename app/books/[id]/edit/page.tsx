"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import ImageUploader from "@/components/ImageUploader";
import Image from "next/image";

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);

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

        const data = docSnap.data();

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
        alert("本の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, router]);

  const updateBook = async () => {
    try {
      setSaving(true);

      let imageUrl = book.imageUrl;

      // 新しい画像が選択された場合のみアップロード
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
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

      alert("更新しました");

      router.push(`/books/${id}`);
    } catch (error) {
      console.error(error);
      alert("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="p-8">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">

      <h1 className="mb-8 text-3xl font-bold">
        📚 本を編集
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
          className="w-full rounded border p-3"
          value={book.stock}
          onChange={(e) =>
            setBook({
              ...book,
              stock: Number(e.target.value),
            })
          }
        />

        {book.imageUrl && (
          <div className="flex justify-center">
            <Image
              src={book.imageUrl}
              alt={book.title}
              width={180}
              height={250}
              className="rounded border"
            />
          </div>
        )}

        <ImageUploader
          onSelectFile={(file) => setImageFile(file)}
        />

        <button
          onClick={updateBook}
          disabled={saving}
          className="w-full rounded bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {saving ? "更新中..." : "更新"}
        </button>

      </div>
    </main>
  );
}