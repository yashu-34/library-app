"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const login = async () => {
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("メールアドレスとパスワードを入力してください。");
      return;
    }

    try {
      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        setErrorMessage("ユーザー情報が存在しません。");
        return;
      }

      const role = userDoc.data().role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/product_search");
      }

    } catch (error: any) {

      switch (error.code) {

        case "auth/user-not-found":
          setErrorMessage("ユーザーが存在しません。");
          break;

        case "auth/wrong-password":
          setErrorMessage("パスワードが違います。");
          break;

        case "auth/invalid-credential":
          setErrorMessage("メールアドレスまたはパスワードが違います。");
          break;

        case "auth/invalid-email":
          setErrorMessage("メールアドレスの形式が正しくありません。");
          break;

        default:
          setErrorMessage("ログインに失敗しました。");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-indigo-100 p-4">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="text-center">

          <div className="text-6xl">
            📚
          </div>

          <h1 className="mt-3 text-3xl font-bold text-blue-700">
            商品貸出システム
          </h1>
        </div>

        <div className="mt-8 space-y-5">

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              メールアドレス
            </label>

            <input
              type="email"
              placeholder="sample@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold text-gray-700">
              パスワード
            </label>

            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

          </div>

          {errorMessage && (

            <div className="rounded-lg bg-red-100 p-3 text-center text-red-600">

              ⚠️ {errorMessage}

            </div>

          )}

          <button
            onClick={login}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-lg font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "ログイン中..." : "🔑 ログイン"}
          </button>

          <div className="text-center text-gray-500">
            または
          </div>

          <Link
            href="/register"
            className="block w-full rounded-xl border-2 border-blue-600 py-3 text-center font-bold text-blue-600 transition hover:bg-blue-50"
          >
            👤 新規利用者登録
          </Link>

        </div>

      </div>

    </main>
  );
}