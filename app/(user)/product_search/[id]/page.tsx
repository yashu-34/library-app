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

    // 同じ商品は1回まで
    const alreadyInCart = cart.some(
    (item) => item.bookId === id
    );

    if (alreadyInCart) {
      showDialog(
        "error",
        "追加できません",
        "このサンプルはお一人様1商品1回までです。"
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
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-[#8B8377]">
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
    <div className="flex min-h-screen bg-gray-100 lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <Header cartCount={cart.length} />

        <div className="mx-auto mt-30 max-w-5xl px-5 pb-20 md:px-8">
          {/* 戻る導線 */}
          <Link
            href="/product_search"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#3F3A36]/55 shadow-sm transition hover:text-[#A9707A]"
          >
            <PiArrowLeftBold className="h-4 w-4" />
            商品一覧へ戻る
          </Link>

          {/* カタログカード本体 */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid gap-0 md:grid-cols-[minmax(0,300px)_1fr]">
              {/* 画像 */}
              <div className="relative flex items-center justify-center overflow-hidden bg-[#F1EDE7] p-8">

                {book.imageUrl ? (
                  <div className="relative z-10 rounded-2xl bg-white p-3 shadow-sm">
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      width={220}
                      height={320}
                      className="h-auto w-[170px] rounded-xl md:w-[210px]"
                    />
                  </div>
                ) : (
                  <div className="relative z-10 flex h-[260px] w-[180px] flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 text-[#3F3A36]/30">
                    <PiImageFill className="h-8 w-8" />
                    <span className="text-xs font-bold tracking-wide">
                      No Image
                    </span>
                  </div>
                )}

                {/* カテゴリバッジ */}
                <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#A9707A] shadow-sm">
                  <PiHeartFill className="h-3 w-3" />
                  {book.category || "CATALOG"}
                </span>
              </div>

              {/* 詳細 */}
              <div className="p-6 md:p-10">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#8B8377]">
                  <PiSparkleFill className="h-3.5 w-3.5" />
                  {isKusuriYu ? "きょうの湯あがり" : "Catalog"}
                </p>

                <h1 className="mb-1 text-2xl font-extrabold leading-snug tracking-wide text-[#3F3A36] md:text-3xl">
                  {book.title}
                </h1>

                <p className="mb-7 text-sm text-[#3F3A36]/45">
                  {isKusuriYu ? book.salesName : book.author}
                  {book.publisher ? ` ／ ${book.publisher}` : ""}
                </p>

                {/* 詳細リスト */}
                <dl className="space-y-3 rounded-2xl bg-gray-100 p-5 text-sm text-[#3F3A36]/80">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE2E3] text-[#A9707A]">
                      <PiFlowerTulipFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#3F3A36]/40">
                        {isKusuriYu ? "販売名" : "香り"}
                      </dt>
                      <dd className="text-right font-bold text-[#3F3A36]">
                        {isKusuriYu ? book.salesName : book.author}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8E4E1] text-[#8B8377]">
                      <PiFileTextFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#3F3A36]/40">
                        説明
                      </dt>
                      <dd className="text-right font-bold text-[#3F3A36]">
                        {book.isbn}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1E7E2] text-[#6E9584]">
                      <PiTagFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#3F3A36]/40">
                        カテゴリ
                      </dt>
                      <dd className="text-right font-bold text-[#3F3A36]">
                        {book.category}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE2C9] text-[#B08A45]">
                      <PiCalendarBlankFill className="h-4 w-4" />
                    </span>
                    <div className="flex w-full items-baseline justify-between gap-3">
                      <dt className="shrink-0 text-xs text-[#3F3A36]/40">
                        販売日
                      </dt>
                      <dd className="text-right font-bold text-[#3F3A36]">
                        {book.publishDate}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* 在庫 */}
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold tracking-wide ${
                      isAvailable
                        ? "bg-[#EDE2E3] text-[#9C6570]"
                        : "bg-[#3F3A36]/10 text-[#3F3A36]/40"
                    }`}
                  >
                    {isAvailable ? `在庫 ${remainingStock}個` : "品切れ"}
                  </span>

                  <div>
                    <p
                      className={`text-sm font-extrabold ${
                        isAvailable ? "text-[#6E9584]" : "text-[#B57373]"
                      }`}
                    >
                      {isAvailable
                        ? isLowStock
                          ? "残りわずかです♪"
                          : "ただいまご用意できます♪"
                        : "現在お取り扱いできません"}
                    </p>
                    <p className="text-xs text-[#3F3A36]/40">
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
                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-teal-700 py-3.5 text-base font-extrabold tracking-wide text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed  disabled:shadow-none md:text-lg"
                  >
                    <PiShoppingCartFill className="h-5 w-5" />
                    {orderedBookIds.includes(id)
                      ? "取り寄せ済み"
                      : remainingStock <= 0
                      ? "在庫なし"
                      : "カートへ追加"}
                  </button>

                  <Link
                    href="/cart"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 text-center font-extrabold text-[#3F3A36] transition hover:border-[#8B7F94]/50 hover:text-[#8B7F94]"
                  >
                    <PiShoppingBagFill className="h-5 w-5 text-[#8B7F94]" />
                    カートを見る（{cart.length}）
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {dialogOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#3F3A36]/35 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-2xl border border-gray-200 bg-white p-7 shadow-xl animate-in fade-in zoom-in duration-200">
              <div className="mb-5 flex justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    dialogType === "success"
                      ? "bg-[#E1E7E2] text-[#6E9584]"
                      : dialogType === "error"
                      ? "bg-[#EFE0E1] text-[#B57373]"
                      : "bg-[#EDE2C9] text-[#B08A45]"
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

              <h2 className="text-center text-xl font-extrabold text-[#3F3A36]">
                {dialogTitle}
              </h2>

              <p className="mt-3 text-center text-sm text-[#3F3A36]/60">
                {dialogMessage}
              </p>

              <button
                onClick={() => setDialogOpen(false)}
                className="mt-6 w-full rounded-full bg-[#A9707A] py-3 font-extrabold tracking-wide text-white transition hover:bg-[#96626C]"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}