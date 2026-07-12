"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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

      setName("");
      setEmail("");
      setPassword("");

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
          break;
      }
    }
  };

  return (
    <main className="mx-auto mt-20 max-w-md rounded-lg border p-8 shadow">
      <h1 className="mb-6 text-center text-2xl font-bold">
        ユーザー登録
      </h1>

      <input
        className="mb-4 w-full rounded border p-2"
        placeholder="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="mb-4 w-full rounded border p-2"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="mb-4 w-full rounded border p-2"
        placeholder="住所"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        className="mb-6 w-full rounded border p-2"
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700"
      >
        登録
      </button>

      <div className="mt-4">
        <button
          onClick={() => router.push("/login")}
          className="w-full rounded border border-gray-300 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
        >
          ← ログイン画面へ戻る
        </button>
      </div>
    </main>
  );
}