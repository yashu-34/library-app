"use client";

import { useCart } from "@/components/user/CartProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/common/Sidebar";
import Image from "next/image";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "@/firebase/config";

import { onAuthStateChanged } from "firebase/auth";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/common/Header";

import {
  BookOpen,
  Trash2,
  ArrowLeft,
  PackageOpen,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  X,
  ShieldCheck,
} from "lucide-react";
import { HiOutlineShoppingCart } from "react-icons/hi2";

const REQUEST_LIMIT = 5;
const LOW_STOCK_THRESHOLD = 2;

type StockMap = Record<string, number>;

type AlertType = "success" | "error" | "warning" | "info";

type AlertInfo = {
  type: AlertType;
  message: string;
};

const ALERT_STYLES: Record<
  AlertType,
  { bg: string; border: string; text: string; icon: React.ReactNode }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    icon: <CheckCircle2 size={20} className="text-green-600" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    icon: <XCircle size={20} className="text-red-600" />,
  },
  warning: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-800",
    icon: <AlertTriangle size={20} className="text-orange-600" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    icon: <Info size={20} className="text-blue-600" />,
  },
};

const TERMS = [
  "本サービスは、本店舗限定のサービスです。",
  "サンプルはお一人様1商品1回分です。",
  `一度にお申込みいただける数量は${REQUEST_LIMIT}包までです。`,
  "商品や在庫状況により、ご希望のサンプルをご用意できない場合があります。",
  "サンプルのお届けには日数がかかる場合があります。",
  "サンプルの転売・譲渡・商用利用はご遠慮ください。",
  "パッケージや仕様は販売商品と異なる場合があります。",
  "使用中・使用後に異常を感じた場合は直ちに使用を中止してください。",
  "乳幼児の手の届かない場所で保管してください。",
];

export default function CartPage() {
  const router = useRouter();

  const { cart, removeCart } = useCart();

  const [userName, setUserName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [stockMap, setStockMap] = useState<StockMap>({});

  // カスタムアラート
  const [alertInfo, setAlertInfo] = useState<AlertInfo | null>(null);

  // 同意モーダル
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserName("");
        setInitializing(false);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists()) {
          setUserName(userSnap.data().name);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // カート内商品の在庫を取得
  useEffect(() => {
    const fetchStocks = async () => {
      if (cart.length === 0) return;

      const uniqueBookIds = Array.from(new Set(cart.map((b) => b.bookId)));

      const entries = await Promise.all(
        uniqueBookIds.map(async (bookId) => {
          try {
            const bookSnap = await getDoc(doc(db, "books", bookId));
            const stock = bookSnap.exists() ? Number(bookSnap.data().stock ?? 0) : 0;
            return [bookId, stock] as const;
          } catch {
            return [bookId, 0] as const;
          }
        })
      );

      setStockMap(Object.fromEntries(entries));
    };

    fetchStocks();
  }, [cart]);

  const hasOutOfStockItem = useMemo(
    () => cart.some((book) => (stockMap[book.bookId] ?? 1) <= 0),
    [cart, stockMap]
  );

  const exceedsLimit = cart.length > REQUEST_LIMIT;

  // アラート表示（5秒後に自動で閉じる）
  const showAlert = (type: AlertType, message: string) => {
    setAlertInfo({ type, message });
  };

  useEffect(() => {
    if (!alertInfo) return;
    const timer = setTimeout(() => setAlertInfo(null), 5000);
    return () => clearTimeout(timer);
  }, [alertInfo]);

  // 取り寄せボタン押下時のバリデーション → 通ったら同意モーダルを開く
  const handleRequestClick = () => {
    const user = auth.currentUser;

    if (!user) {
      showAlert("error", "ログインしてください");
      return;
    }

    if (cart.length === 0) {
      showAlert("warning", "取り寄せる商品を選択してください");
      return;
    }

    if (exceedsLimit) {
      showAlert("warning", `一度にお申込みいただける数量は${REQUEST_LIMIT}点までです`);
      return;
    }

    const bookIds = new Set<string>();
    for (const book of cart) {
      if (bookIds.has(book.bookId)) {
        showAlert("warning", `「${book.title}」はお一人様1商品1回までです。`);
        return;
      }
      bookIds.add(book.bookId);
    }

    setAgreed(false);
    setShowConsentModal(true);
  };

  // 同意モーダルで「同意して取り寄せる」を押した後の実処理
  const submitRequest = async () => {
    const user = auth.currentUser;
    if (!user) {
      setShowConsentModal(false);
      showAlert("error", "ログインしてください");
      return;
    }

    setShowConsentModal(false);
    setSubmitting(true);

    try {
      const outOfStockTitles: string[] = [];
      const alreadyRentedTitles: string[] = [];
      let successCount = 0;

      for (const book of cart) {
        // 過去に取り寄せ済みか確認
        const rentalQuery = query(
          collection(db, "rentals"),
          where("userId", "==", user.uid),
          where("bookId", "==", book.bookId)
        );

        const rentalSnapshot = await getDocs(rentalQuery);

        if (!rentalSnapshot.empty) {
          alreadyRentedTitles.push(book.title);
          continue;
        }

        const bookRef = doc(db, "books", book.bookId);
        const bookSnap = await getDoc(bookRef);

        if (!bookSnap.exists()) continue;

        const stock = bookSnap.data().stock ?? 0;

        if (stock <= 0) {
          outOfStockTitles.push(book.title);
          continue;
        }

        await addDoc(collection(db, "rentals"), {
          bookId: book.bookId,
          bookTitle: book.title,
          userId: user.uid,
          userName: userName,
          borrowDate: new Date().toISOString().split("T")[0],
          returnDate: "",
          status: "borrowed",
          createdAt: serverTimestamp(),
        });

        await updateDoc(bookRef, { stock: stock - 1 });
        await removeCart(book.id);

        successCount += 1;
      }

      const messages: string[] = [];

      if (successCount > 0) {
        messages.push(
          `${userName}さんの取り寄せ手続きが完了しました（${successCount}点）`
        );
      }

      if (alreadyRentedTitles.length > 0) {
        messages.push(
          `既に取り寄せ済みのため対象外でした：\n${alreadyRentedTitles.join("\n")}`
        );
      }

      if (outOfStockTitles.length > 0) {
        messages.push(
          `在庫切れのため取り寄せできませんでした：\n${outOfStockTitles.join("\n")}`
        );
      }

      if (messages.length > 0) {
        showAlert(successCount > 0 ? "success" : "error", messages.join("\n\n"));
      }

      if (successCount > 0) {
        setTimeout(() => router.push("/rentals"), 1200);
      }
    } catch (error) {
      console.error(error);
      showAlert("error", "取り寄せに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 lg:ml-72">
      <Sidebar />

      <main className="flex-1">
        <Header cartCount={cart.length} />

        {/* カスタムアラート（トースト） */}
        {alertInfo && (
          <div className="fixed top-20 left-1/2 z-[60] w-[92%] max-w-md -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0">
            <div
              className={`flex items-start gap-3 rounded-2xl border ${ALERT_STYLES[alertInfo.type].border} ${ALERT_STYLES[alertInfo.type].bg} p-4 shadow-lg backdrop-blur`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {ALERT_STYLES[alertInfo.type].icon}
              </div>
              <p
                className={`flex-1 whitespace-pre-line text-sm font-semibold leading-relaxed ${ALERT_STYLES[alertInfo.type].text}`}
              >
                {alertInfo.message}
              </p>
              <button
                onClick={() => setAlertInfo(null)}
                className={`flex-shrink-0 rounded-full p-1 hover:bg-black/5 ${ALERT_STYLES[alertInfo.type].text}`}
                aria-label="閉じる"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto mt-24 max-w-5xl px-4 sm:mt-28 sm:px-6">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-5 shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <HiOutlineShoppingCart className="text-2xl text-teal-700" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">カート</h1>
              <p className="text-sm text-gray-500">取り寄せる商品を確認できます</p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-24 pb-32 sm:px-6 sm:pt-28">
          {initializing ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-white shadow" />
              ))}
            </div>
          ) : cart.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl">
              <PackageOpen className="mx-auto mb-3 text-gray-300" size={40} />
              <p className="text-gray-500">カートに商品がありません</p>
              <Link
                href="/product_search"
                className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-green-700"
              >
                商品を探しに行く
              </Link>
            </div>
          ) : (
            <>
              {exceedsLimit && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 shadow">
                  <AlertTriangle size={18} />
                  一度にお申込みいただける数量は{REQUEST_LIMIT}点までです（現在{cart.length}点）
                </div>
              )}

              <div className="space-y-4">
                {cart.map((book) => {
                  const stock = stockMap[book.bookId];
                  const isOutOfStock = stock !== undefined && stock <= 0;
                  const isLowStock =
                    stock !== undefined && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

                  return (
                    <div
                      key={book.id}
                      className={`flex flex-col gap-4 sm:gap-5 rounded-2xl bg-white p-4 sm:p-5 shadow md:flex-row md:items-center md:justify-between ${
                        isOutOfStock ? "opacity-60" : ""
                      }`}
                    >
                      <div className="flex justify-center md:w-40">
                        <Image
                          src={book.imageUrl || "/images/no-image.png"}
                          alt={book.title}
                          width={120}
                          height={120}
                          className="h-28 sm:h-32 w-auto rounded-lg object-contain"
                        />
                      </div>

                      <div className="flex-1">
                        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
                          <BookOpen size={20} className="text-gray-500 flex-shrink-0" />
                          {book.title}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">著者</p>
                        <p className="font-semibold text-gray-800">{book.author}</p>

                        <div className="mt-2">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              在庫切れ
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                              残りわずか（あと{stock}点）
                            </span>
                          ) : stock !== undefined ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                              在庫あり
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-400">
                              在庫確認中...
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => removeCart(book.id)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-100 px-6 py-3 font-bold text-red-600 transition hover:bg-red-200"
                      >
                        <Trash2 size={18} />
                        削除
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <Link
            href="/product_search"
            className="mt-6 flex items-center justify-center gap-2 w-full rounded-lg bg-gray-600 py-3 text-center font-bold text-white hover:bg-gray-700"
          >
            <ArrowLeft size={18} />
            商品一覧へ戻る
          </Link>
        </div>

        {cart.length > 0 && !initializing && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur lg:left-72">
            <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-gray-900">
                合計 {cart.length}点
                {hasOutOfStockItem && (
                  <span className="ml-2 text-xs font-normal text-red-600">
                    在庫切れの商品を削除してください
                  </span>
                )}
              </p>

              <button
                onClick={handleRequestClick}
                disabled={submitting || hasOutOfStockItem || exceedsLimit}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    処理中...
                  </>
                ) : (
                  <>
                    <BookOpen size={18} />
                    まとめて取り寄せる
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 同意モーダル */}
        {showConsentModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                  <ShieldCheck className="text-teal-700" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">サービス利用と注意点</h2>
                  <p className="text-xs text-gray-500">
                    内容をご確認のうえ、同意して取り寄せてください
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <ul className="space-y-2.5 text-sm text-gray-700">
                  {TERMS.map((term, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-0.5 flex-shrink-0 text-teal-600">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>

                <label className="mt-5 flex cursor-pointer items-start gap-2 rounded-xl bg-gray-50 p-3">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 accent-teal-600"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    上記の内容に同意します
                  </span>
                </label>
              </div>

              <div className="flex gap-3 border-t border-gray-100 p-5">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1 rounded-lg bg-gray-100 py-3 font-bold text-gray-700 hover:bg-gray-200"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitRequest}
                  disabled={!agreed}
                  className="flex-1 rounded-lg bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  同意して取り寄せる
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}