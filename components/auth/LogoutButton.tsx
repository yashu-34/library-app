"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <button
      onClick={logout}
      className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
    >
      ログアウト
    </button>
  );
}