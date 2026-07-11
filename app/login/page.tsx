"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch {
      alert("メールアドレスまたはパスワードが違います。");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-96 rounded-lg border p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">
          図書管理システム
        </h1>

        <input
          className="mb-4 w-full rounded border p-2"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="mb-6 w-full rounded border p-2"
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
        >
          ログイン
        </button>
      </div>
    </main>
  );
}