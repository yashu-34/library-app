"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setMessage("メールアドレスを入力してください。");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, email);

      setMessage(
        "パスワード再設定用のメールを送信しました。メールをご確認ください。"
      );
    } catch (error: any) {
      console.error(error);

      switch (error.code) {
        case "auth/user-not-found":
          setMessage("このメールアドレスは登録されていません。");
          break;

        case "auth/invalid-email":
          setMessage("メールアドレスの形式が正しくありません。");
          break;

        default:
          setMessage("メール送信に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">

        <h1 className="mb-6 text-center text-2xl font-bold">
          パスワード再設定
        </h1>

        <input
          type="email"
          placeholder="メールアドレス"
          className="mb-4 w-full rounded-lg border p-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleReset}
          disabled={loading}
          className="w-full rounded-lg bg-teal-600 py-3 font-bold text-white hover:bg-teal-700"
        >
          {loading ? "送信中..." : "メールを送信"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-teal-600 hover:underline"
          >
            ログイン画面へ戻る
          </Link>
        </div>

      </div>
    </main>
  );
}