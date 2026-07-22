"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { auth, db } from "@/firebase/config";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { useCart } from "@/components/user/CartProvider";

import Sidebar from "@/components/common/Sidebar";
import Header from "@/components/common/Header";

// react-icons (Feather set) — `npm install react-icons` if not already installed
import {
  FiShoppingCart,
  FiShoppingBag,
  FiArrowLeft,
  FiUser,
  FiFileText,
  FiTag,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiImage,
} from "react-icons/fi";

interface Book {
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: string;
  publishDate: string;
  imageUrl: string;
  stock: number;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { cart, addCart } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowCount, setBorrowCount] = useState(0);

  // =======================
  // ログイン確認
  // =======================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      // 管理者チェック
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (userSnap.exists()) {
        const role = userSnap.data().role;
        if (role === "admin") {
          router.push("/admin");
          return;
        }
      }

      // 現在借りている冊数取得
      const q = query(
        collection(db, "rentals"),
        where("userId", "==", user.uid),
        where("status", "==", "borrowed")
      );

      const snapshot = await getDocs(q);
      setBorrowCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [router]);

  // =======================
  // 本取得
  // =======================
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const snapshot = await getDoc(doc(db, "books", id));

        if (!snapshot.exists()) {
          alert("本が存在しません");
          router.push("/product_search");
          return;
        }

        setBook(snapshot.data() as Book);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, router]);

  // カート内同じ本数
  const cartBookCount = cart.filter((item) => item.bookId === id).length;

  // カート込み残り在庫
  const remainingStock = book ? Math.max(book.stock - cartBookCount, 0) : 0;

  // =======================
  // カート追加
  // =======================
  const handleAddCart = async () => {
    if (!book) return;

    if (remainingStock <= 0) {
      alert("在庫がありません");
      return;
    }

    await addCart({
      id: "",
      bookId: id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      stock: book.stock,
    });

    alert(`${book.title}をカートへ追加しました`);
  };

  if (loading || !book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F3EA]">
        <p className="font-serif text-[#1E2A3A]/70 tracking-wide">
          読み込み中...
        </p>
      </main>
    );
  }

  const isAvailable = remainingStock > 0;

  return (
    <div className="flex min-h-screen bg-[#FFFFFF] lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <Header cartCount={cart.length} />

        <div className="mx-auto mt-30 max-w-5xl px-5 pb-16 md:px-8">
          {/* パンくず的な戻る導線 */}
          <Link
            href="/product_search"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#1E2A3A]/60 transition hover:text-[#B8874A]"
          >
            <FiArrowLeft className="h-4 w-4" />
            商品一覧へ戻る
          </Link>

          {/* カタログカード本体 */}
          <div className="overflow-hidden rounded-sm border border-[#1E2A3A]/10 bg-[#f3f4f6] shadow-[0_1px_2px_rgba(30,42,58,0.06),0_12px_32px_-16px_rgba(30,42,58,0.25)]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,280px)_1fr]">
              {/* 画像 — 書棚から抜き出したような影付き */}
              <div className="flex items-center justify-center border-b border-[#1E2A3A]/10 bg-[#1E2A3A] p-8 md:border-b-0 md:border-r">
                {book.imageUrl ? (
                  <div className="relative">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      width={220}
                      height={320}
                      className="h-auto w-[180px] rounded-[2px] shadow-[6px_10px_24px_rgba(0,0,0,0.45)] md:w-[220px]"
                    />
                  </div>
                ) : (
                  <div className="flex h-[280px] w-[190px] flex-col items-center justify-center gap-2 rounded-[2px] bg-white/5 text-white/40">
                    <FiImage className="h-8 w-8" />
                    <span className="text-xs tracking-wide">No Image</span>
                  </div>
                )}
              </div>

              {/* 詳細 */}
              <div className="p-6 md:p-10">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B8874A]">
                  {book.category || "Catalog"}
                </p>

                <h1 className="mb-6 font-serif text-2xl leading-snug text-[#1E2A3A] md:text-3xl">
                  {book.title}
                </h1>

                <dl className="space-y-4 border-t border-[#1E2A3A]/10 pt-6 text-sm text-[#1E2A3A]/80">
                  <div className="flex items-start gap-3">
                    <FiUser className="mt-0.5 h-4 w-4 shrink-0 text-[#B8874A]" />
                    <div>
                      <dt className="text-xs text-[#1E2A3A]/45">販売名</dt>
                      <dd className="font-medium text-[#1E2A3A]">
                        {book.author}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiFileText className="mt-0.5 h-4 w-4 shrink-0 text-[#B8874A]" />
                    <div>
                      <dt className="text-xs text-[#1E2A3A]/45">説明</dt>
                      <dd className="font-medium text-[#1E2A3A]">
                        {book.isbn}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiTag className="mt-0.5 h-4 w-4 shrink-0 text-[#B8874A]" />
                    <div>
                      <dt className="text-xs text-[#1E2A3A]/45">
                        カテゴリ
                      </dt>
                      <dd className="font-medium text-[#1E2A3A]">
                        {book.category}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FiCalendar className="mt-0.5 h-4 w-4 shrink-0 text-[#B8874A]" />
                    <div>
                      <dt className="text-xs text-[#1E2A3A]/45">
                        販売日
                      </dt>
                      <dd className="font-medium text-[#1E2A3A]">
                        {book.publishDate}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* 在庫スタンプ — サイン要素 */}
                <div
                  className={`mt-8 inline-flex items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold tracking-wide ${
                    isAvailable
                      ? "border-[#5F7A63] text-[#5F7A63]"
                      : "border-[#A8402F] text-[#A8402F]"
                  }`}
                  style={{ transform: "rotate(-2deg)" }}
                >
                  {isAvailable ? (
                    <FiCheckCircle className="h-4 w-4" />
                  ) : (
                    <FiXCircle className="h-4 w-4" />
                  )}
                  残り：{remainingStock}個
                </div>

                {/* アクション */}
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={handleAddCart}
                    disabled={remainingStock <= 0}
                    className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#1E2A3A] py-3 text-base font-bold text-white transition hover:bg-[#B8874A] disabled:cursor-not-allowed disabled:bg-[#1E2A3A]/30 md:text-lg"
                  >
                    <FiShoppingCart className="h-5 w-5" />
                    {remainingStock <= 0 ? "在庫なし" : "カートへ追加"}
                  </button>

                  <Link
                    href="/cart"
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-[#1E2A3A]/15 bg-white py-3 text-center font-bold text-[#1E2A3A] transition hover:border-[#1E2A3A]/40"
                  >
                    <FiShoppingBag className="h-5 w-5 text-[#B8874A]" />
                    カートを見る（{cart.length}）
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}