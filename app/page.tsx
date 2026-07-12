"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // 未ログイン
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        // Firestoreからユーザー情報を取得
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (!userDoc.exists()) {
          console.error("ユーザー情報が存在しません");
          router.replace("/login");
          return;
        }

        const role = userDoc.data().role;

        // 権限で振り分け
        if (role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました", error);
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-600">
        読み込み中...
      </p>
    </div>
  );
}