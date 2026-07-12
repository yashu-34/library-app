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

      <table className="w-full border">

        <thead className="bg-blue-600 text-white">

          <tr>
            <th className="border p-3">名前</th>
            <th className="border p-3">メールアドレス</th>
            <th className="border p-3">住所</th>
            <th className="border p-3">権限</th>
            <th className="border p-3">変更</th>
          </tr>

        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.id}>

              <td className="border p-3 text-black">
                {user.name}
              </td>

              <td className="border p-3 text-black">
                {user.email}
              </td>

              <td className="border p-3 text-black">
                {user.address}
              </td>

              <td className="border p-3 text-black">
                {user.role}
              </td>

              <td className="border p-3 text-black">

                <select
                  value={user.role}
                  onChange={(e) =>
                    changeRole(user.id, e.target.value)
                  }
                  className="rounded border p-2"
                >
                  <option value="user">
                    user
                  </option>

                  <option value="admin">
                    admin
                  </option>

                </select>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>
  );
}