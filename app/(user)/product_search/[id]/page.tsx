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

import {
  PiArrowLeftBold,
  PiFlowerTulipFill,
  PiFileTextFill,
  PiTagFill,
  PiCalendarBlankFill,
  PiCheckCircleFill,
  PiXCircleFill,
  PiWarningFill,
  PiImageFill,
  PiShoppingCartFill,
  PiShoppingBagFill,
  PiSparkleFill,
  PiHeartFill,
} from "react-icons/pi";

interface Book {
  title: string;
  author: string;
  salesName?: string;
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
  const [orderedBookIds, setOrderedBookIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState<
    "success" | "error" | "warning"
  >("success");

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

      const q = query(
        collection(db, "rentals"),
        where("userId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const rentalList = snapshot.docs.map((doc) => doc.data());

      setBorrowCount(
        rentalList.filter((rental: any) => rental.status === "borrowed")
          .length
      );

      // 一度でも取り寄せた商品ID
      setOrderedBookIds(rentalList.map((rental: any) => rental.bookId));
    });

    return () => unsubscribe();
  }, [router]);

  // =======================
  // 商品取得
  // =======================
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const snapshot = await getDoc(doc(db, "books", id));

        if (!snapshot.exists()) {
          alert("商品が存在しません");
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

  // カート内同じ商品
  const cartBookCount = cart.filter((item) => item.bookId === id).length;

  // カート込み残り在庫
  const remainingStock = book ? Math.max(book.stock - cartBookCount, 0) : 0;

  const showDialog = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  // =======================
  // カート追加
  // =======================
  const handleAddCart = async () => {
    if (!book) return;

    // 最大5商品まで
    if (cart.length >= 5) {
      showDialog(
        "warning",
        "申込み上限",
        "一度にお申込みいただける数量は5包までです。"
      );
      return;
    }

    // 過去に取り寄せ済み
    if (orderedBookIds.includes(id)) {
      showDialog(
        "error",
        "追加できません",
        "この商品は過去に取り寄せ済みのため、再度取り寄せできません。"
      );
      return;
    }

    // 在庫切れ
    if (remainingStock <= 0) {
      showDialog("error", "在庫切れ", "この商品は在庫切れです。");
      return;
    }

    await addCart({
      id: crypto.randomUUID(),
      bookId: id,
      title: book.title,
      author: book.author,
      imageUrl: book.imageUrl,
      stock: book.stock,
    });

    showDialog("success", "追加完了", `${book.title}をカートへ追加しました。`);
  };

  if (loading || !book) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFF6F2]">
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-[#B995D6]">
          <PiSparkleFill className="h-4 w-4 animate-pulse" />
          よみこみ中 ・ ・ ・
        </p>
      </main>
    );
  }

  const isAvailable = remainingStock > 0;
  const isLowStock = isAvailable && remainingStock <= 3;
  const isKusuriYu = book.category === "極くすり湯";

  return (
    <div className="flex min-h-screen bg-[#FFF6F2] lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <Header cartCount={cart.length} />

        <div className="mx-auto mt-30 max-w-5xl px-5 pb-20 md:px-8">
          {/* 戻る導線 */}
          <Link
            href="/product_search"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#4A3B52]/60 shadow-sm transition hover:text-[#FF6F91]"
          >
            <PiArrowLeftBold className="h-4 w-4" />
            商品一覧へ戻る
          </Link>

          {/* カタログカード本体 */}
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-white bg-white shadow-[0_18px_50px_-20px_rgba(185,166,224,0.55)]">
            <div className="grid gap-0 md:grid-cols-[minmax(0,300px)_1fr]">
              {/* 画像 — あわがふわふわ */}
              <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFD9E6] via-[#F4E4FF] to-[#CDEFEA] p-8 md:rounded-tr-[3rem] md:rounded-br-[3rem]">
                {/* あわアニメーション */}
                <div className="pointer-events-none absolute inset-0">
                  <span className="bubble bubble-1" />
                  <span className="bubble bubble-2" />
                  <span className="bubble bubble-3" />
                  <span className="bubble bubble-4" />
                  <span className="bubble bubble-5" />
                  <span className="bubble bubble-6" />
                  <span className="bubble bubble-7" />
                  <span className="bubble bubble-8" />
                  <span className="bubble bubble-9" />
                </div>

                {book.imageUrl ? (
                  <div className="relative z-10 rounded-3xl bg-white/70 p-3 shadow-[0_16px_30px_-10px_rgba(255,143,171,0.45)] backdrop-blur-sm">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      width={220}
                      height={320}
                      className="h-auto w-[170px] rounded-2xl md:w-[210px]"
                    />
                  </div>
                ) : (
                  <div className="relative z-10 flex h-[260px] w-[180px] flex-col items-center justify-center gap-2 rounded-3xl bg-white/60 text-[#4A3B52]/30">
                    <PiImageFill className="h-8 w-8" />
                    <span className="text-xs font-bold tracking-wide">
                      No Image
                    </span>
                  </div>
                )}

                {/* カテゴリバッジ */}
                <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#FF6F91] shadow-md">
                  <PiHeartFill className="h-3 w-3" />
                  {book.category || "CATALOG"}
                </span>
              </div>

              {/* 詳細 */}
              <div className="p-6 md:p-10">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#B995D6]">
                  <PiSparkleFill className="h-3.5 w-3.5" />
                  {isKusuriYu ? "きょうの湯あがり" : "Catalog"}
                </p>

                <h1 className="mb-1 text-2xl font-extrabold leading-snug tracking-wide text-[#4A3B52] md:text-3xl">
                  {book.title}
                </h1>

                <p className="mb-7 text-sm text-[#4A3B52]/45">
                  {isKusuriYu ? book.salesName : book.author}
                  {book.publisher ? ` ／ ${book.publisher}` : ""}
                </p>

                {/* 詳細リスト — まるアイコンチップ */}
                <dl className="space-y-3 rounded-3xl bg-[#FFF6F2] p-5 text-sm text-[#4A3B52]/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFD9E6] text-[#FF6F91]">
                      <PiFlowerTulipFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#4A3B52]/40">
                        {isKusuriYu ? "販売名" : "香り"}
                      </dt>
                      <dd className="text-right font-bold text-[#4A3B52]">
                        {isKusuriYu ? book.salesName : book.author}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F4E4FF] text-[#B995D6]">
                      <PiFileTextFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#4A3B52]/40">
                        説明
                      </dt>
                      <dd className="text-right font-bold text-[#4A3B52]">
                        {book.isbn}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#CDEFEA] text-[#4FBBA6]">
                      <PiTagFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#4A3B52]/40">
                        カテゴリ
                      </dt>
                      <dd className="text-right font-bold text-[#4A3B52]">
                        {book.category}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFEBB8] text-[#E3A93E]">
                      <PiCalendarBlankFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#4A3B52]/40">
                        販売日
                      </dt>
                      <dd className="text-right font-bold text-[#4A3B52]">
                        {book.publishDate}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* 在庫 — シンプルタグ */}
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold tracking-wide ${
                      isAvailable
                        ? "bg-[#FFD9E6] text-[#C4356F]"
                        : "bg-[#4A3B52]/10 text-[#4A3B52]/40"
                    }`}
                  >
                    {isAvailable ? `在庫 ${remainingStock}個` : "品切れ"}
                  </span>

                  <div>
                    <p
                      className={`text-sm font-extrabold ${
                        isAvailable ? "text-[#4FBBA6]" : "text-[#E17878]"
                      }`}
                    >
                      {isAvailable
                        ? isLowStock
                          ? "残りわずかです♪"
                          : "ただいまご用意できます♪"
                        : "現在お取り扱いできません"}
                    </p>
                    <p className="text-xs text-[#4A3B52]/40">
                      {isAvailable
                        ? "在庫は確保次第、順次発送いたします"
                        : "入荷までしばらくお待ちください"}
                    </p>
                  </div>
                </div>

                {/* アクション */}
                <div className="mt-8 flex flex-col gap-3">
                  <button
                    onClick={handleAddCart}
                    disabled={remainingStock <= 0}
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF9CB5] to-[#FF6F91] py-3.5 text-base font-extrabold tracking-wide text-white shadow-[0_10px_24px_-8px_rgba(255,111,145,0.6)] transition hover:scale-[1.02] hover:shadow-[0_14px_28px_-8px_rgba(255,111,145,0.7)] disabled:cursor-not-allowed disabled:scale-100 disabled:bg-none disabled:bg-[#4A3B52]/15 disabled:text-[#4A3B52]/40 disabled:shadow-none md:text-lg"
                  >
                    <PiShoppingCartFill className="h-5 w-5 transition group-hover:-rotate-6 group-hover:scale-110" />
                    {orderedBookIds.includes(id)
                      ? "取り寄せ済み"
                      : remainingStock <= 0
                      ? "在庫なし"
                      : "この一包をカートへ"}
                  </button>

                  <Link
                    href="/cart"
                    className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#F4E4FF] bg-white py-3 text-center font-extrabold text-[#4A3B52] transition hover:border-[#B995D6]/50 hover:text-[#B995D6]"
                  >
                    <PiShoppingBagFill className="h-5 w-5 text-[#B995D6]" />
                    カートを見る（{cart.length}）
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#4A3B52]/40 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-[2rem] border-2 border-white bg-white p-7 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="mb-5 flex justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    dialogType === "success"
                      ? "bg-[#CDEFEA] text-[#4FBBA6]"
                      : dialogType === "error"
                      ? "bg-[#FFDCE0] text-[#E17878]"
                      : "bg-[#FFEBB8] text-[#E3A93E]"
                  }`}
                >
                  {dialogType === "success" && (
                    <PiCheckCircleFill className="text-3xl" />
                  )}
                  {dialogType === "error" && (
                    <PiXCircleFill className="text-3xl" />
                  )}
                  {dialogType === "warning" && (
                    <PiWarningFill className="text-3xl" />
                  )}
                </div>
              </div>

              <h2 className="text-center text-xl font-extrabold text-[#4A3B52]">
                {dialogTitle}
              </h2>

              <p className="mt-3 text-center text-sm text-[#4A3B52]/60">
                {dialogMessage}
              </p>

              <button
                onClick={() => setDialogOpen(false)}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#FF9CB5] to-[#FF6F91] py-3 font-extrabold tracking-wide text-white transition hover:scale-[1.02]"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes bubbleRise {
          0% {
            transform: translate(0, 10px) scale(0.5);
            opacity: 0;
          }
          15% {
            opacity: 0.9;
          }
          50% {
            transform: translate(8px, -80px) scale(1);
          }
          75% {
            transform: translate(-6px, -120px) scale(1.05);
          }
          92% {
            opacity: 0.5;
          }
          100% {
            transform: translate(4px, -170px) scale(0.9);
            opacity: 0;
          }
        }
        .bubble {
          position: absolute;
          bottom: 0;
          border-radius: 9999px;
          background: radial-gradient(
            circle at 32% 28%,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(255, 255, 255, 0.55) 28%,
            rgba(255, 255, 255, 0.15) 60%,
            rgba(255, 255, 255, 0.35) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: inset -2px -2px 4px rgba(180, 150, 190, 0.25),
            0 2px 6px rgba(255, 255, 255, 0.3);
          animation: bubbleRise 5.5s ease-in-out infinite;
        }
        .bubble-1 {
          left: 8%;
          width: 9px;
          height: 9px;
          animation-duration: 4.8s;
          animation-delay: 0s;
        }
        .bubble-2 {
          left: 22%;
          width: 18px;
          height: 18px;
          animation-duration: 6.4s;
          animation-delay: 1s;
        }
        .bubble-3 {
          left: 38%;
          width: 7px;
          height: 7px;
          animation-duration: 4.2s;
          animation-delay: 2.1s;
        }
        .bubble-4 {
          left: 50%;
          width: 14px;
          height: 14px;
          animation-duration: 5.8s;
          animation-delay: 0.5s;
        }
        .bubble-5 {
          left: 64%;
          width: 11px;
          height: 11px;
          animation-duration: 5s;
          animation-delay: 2.8s;
        }
        .bubble-6 {
          left: 74%;
          width: 20px;
          height: 20px;
          animation-duration: 7s;
          animation-delay: 1.6s;
        }
        .bubble-7 {
          left: 85%;
          width: 8px;
          height: 8px;
          animation-duration: 4.5s;
          animation-delay: 3.4s;
        }
        .bubble-8 {
          left: 92%;
          width: 13px;
          height: 13px;
          animation-duration: 6s;
          animation-delay: 0.2s;
        }
        .bubble-9 {
          left: 12%;
          width: 15px;
          height: 15px;
          animation-duration: 6.8s;
          animation-delay: 4s;
        }
        @media (prefers-reduced-motion: reduce) {
          .bubble {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}