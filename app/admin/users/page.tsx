"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase/config";

interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));

    const list: User[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<User, "id">),
    }));

    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (
    uid: string,
    role: string
  ) => {
    await updateDoc(doc(db, "users", uid), {
      role,
    });

    fetchUsers();
  };

  return (
    <main className="p-8">

      <h1 className="mb-8 text-3xl font-bold text-black">
        👤 利用者一覧
      </h1>

      {/* PC表示 */}
      <div className="hidden overflow-x-auto rounded-xl border bg-white shadow md:block">
        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3 text-left">名前</th>
              <th className="p-3 text-left">メールアドレス</th>
              <th className="p-3 text-left">住所</th>
              <th className="p-3 text-left">権限</th>
              <th className="p-3 text-left">変更</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-3 text-black">{user.name}</td>
                <td className="p-3 text-black">{user.email}</td>
                <td className="p-3 text-black">{user.address}</td>
                <td className="p-3 text-black">{user.role}</td>
                <td className="p-3">
                  <select
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    className="rounded border p-2"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* スマホ表示 */}
      <div className="space-y-4 md:hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl border bg-white p-4 shadow"
          >
            <div className="mb-2">
              <p className="text-xs text-gray-500">名前</p>
              <p className="font-semibold text-black">{user.name}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">メールアドレス</p>
              <p className="break-all text-black">{user.email}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">住所</p>
              <p className="text-black">{user.address}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-500">現在の権限</p>
              <p className="font-semibold text-black">{user.role}</p>
            </div>

            <select
              value={user.role}
              onChange={(e) => changeRole(user.id, e.target.value)}
              className="mt-2 w-full rounded-lg border p-2"
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        ))}
      </div>

    </main>
  );
}