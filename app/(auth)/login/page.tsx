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

      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // Firestoreからユーザー情報取得
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        setErrorMessage("ユーザー情報が存在しません。");
        return;
      }

      const role = userDoc.data().role;

      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
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
          console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-8 text-center text-3xl font-bold text-black">
          📚 図書館貸出システム
        </h1>

        <input
          className="mb-4 w-full rounded border p-3"
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded border p-3"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMessage && (
          <p className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded bg-blue-600 p-3 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>

        <div className="mt-4">
        <Link
          href="/register"
          className="block w-full rounded border border-blue-600 p-3 text-center font-medium text-blue-600 transition hover:bg-blue-50"
        >
          新規登録はこちら
        </Link>
      </div>
              
      </div>
    </main>
  );
}