"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        address,
        role: "user",
      });

      alert("登録しました！");

      router.push("/dashboard");

    } catch (error: any) {
      console.error(error);

      switch (error.code) {
        case "auth/email-already-in-use":
          alert("このメールアドレスは既に登録されています。");
          break;

        case "auth/invalid-email":
          alert("メールアドレスの形式が正しくありません。");
          break;

        case "auth/weak-password":
          alert("パスワードは6文字以上で入力してください。");
          break;

        default:
          alert("登録に失敗しました。");
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">

      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-8">

        <div className="text-center">

          <div className="text-6xl">📚</div>

          <h1 className="mt-3 text-3xl font-bold text-blue-700">
            図書館利用者登録
          </h1>

          <p className="mt-2 text-gray-500">
            図書館貸出システムへようこそ
          </p>

        </div>

        <div className="mt-8 space-y-5">

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              名前
            </label>

            <input
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="山田 太郎"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              メールアドレス
            </label>

            <input
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="sample@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              住所
            </label>

            <input
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="愛知県名古屋市..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              パスワード
            </label>

            <input
              type="password"
              className="mb-4 w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={register}
            className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white transition hover:bg-blue-700"
          >
            📚 利用者登録
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full rounded-lg border border-gray-300 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            ← ログイン画面へ戻る
          </button>

        </div>

      </div>

    </main>
  );
}