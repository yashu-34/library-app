"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminPage() {

  const [bookCount, setBookCount] = useState(0);

  const [rentalCount, setRentalCount] = useState(0);

  const [borrowerCount, setBorrowerCount] = useState(0);



  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        // 本の冊数取得
        const booksSnapshot =
          await getDocs(
            collection(db, "books")
          );

        setBookCount(
          booksSnapshot.size
        );



        // 貸出中の本数取得
        const rentalsSnapshot =
          await getDocs(
            collection(db, "rentals")
          );


        const borrowingBooks =
          rentalsSnapshot.docs.filter(
            (doc) =>
              doc.data().status === "borrowed"
          );


        setRentalCount(
          borrowingBooks.length
        );



        // 貸出中の利用者数取得
        const userSnapshot =
          await getDocs(
            collection(db, "rentals")
          );


        // statusがborrowedだけ取得
        const borrowingRentals =
          userSnapshot.docs.filter(
            (doc) =>
              doc.data().status === "borrowed"
          );


        // userIdを重複なしで取得
        const borrowerIds = new Set(
          borrowingRentals.map(
            (doc) => doc.data().userId
          )
        );


setBorrowerCount(
  borrowerIds.size
);



      } catch(error){

        console.error(
          "管理者情報取得失敗",
          error
        );

      }

    };


    fetchDashboardData();


  }, []);




  return (

    <main>


      <h1 className="mb-8 text-3xl font-bold text-black">
        📚 管理者ダッシュボード
      </h1>



      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">


        <Link
          href="/admin/books"
          className="rounded-lg border bg-white p-6 shadow transition hover:bg-blue-50"
        >

          <div className="text-4xl">
            📚
          </div>

          <h2 className="mt-4 text-xl font-bold text-black">
            本管理
          </h2>

          <p className="mt-2 text-gray-500">
            本の登録・編集・削除
          </p>

        </Link>




        <Link
          href="/admin/users"
          className="rounded-lg border bg-white p-6 shadow transition hover:bg-blue-50"
        >

          <div className="text-4xl">
            👤
          </div>

          <h2 className="mt-4 text-xl font-bold text-black">
            ユーザー管理
          </h2>

          <p className="mt-2 text-gray-500">
            利用者一覧・権限変更
          </p>

        </Link>




        <Link
          href="/admin/rentals"
          className="rounded-lg border bg-white p-6 shadow transition hover:bg-blue-50"
        >

          <div className="text-4xl">
            📖
          </div>

          <h2 className="mt-4 text-xl font-bold text-black">
            貸出管理
          </h2>

          <p className="mt-2 text-gray-500">
            貸出・返却管理
          </p>

        </Link>


      </div>





      <div className="mt-10 grid gap-6 md:grid-cols-3">


        {/* 登録冊数 */}

        <div className="rounded-lg bg-blue-600 p-6 text-white">

          <h2 className="text-lg font-bold">
            📚 登録冊数
          </h2>


          <p className="mt-4 text-4xl font-bold">
            {bookCount}冊
          </p>

        </div>





        {/* 貸出中 */}

        <div className="rounded-lg bg-green-600 p-6 text-white">

          <h2 className="text-lg font-bold">
            📖 貸出中
          </h2>


          <p className="mt-4 text-4xl font-bold">
            {rentalCount}冊
          </p>

        </div>





        {/* 利用者数 */}

        <div className="rounded-lg bg-orange-500 p-6 text-white">

          <h2 className="text-lg font-bold">
            👤 利用者数
          </h2>


          <p className="mt-4 text-4xl font-bold">
            {borrowerCount}人
          </p>

        </div>



      </div>


    </main>

  );

}