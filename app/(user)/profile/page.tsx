"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  auth,
  db
} from "@/firebase/config";


import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";


import Sidebar from "@/components/common/Sidebar";



interface User {

  name:string;

  email:string;

  address:string;

}






export default function DashboardPage(){


const router = useRouter();



const [user,setUser] =
useState<User|null>(null);



const [borrowCount,setBorrowCount]
=
useState(0);



const [loading,setLoading]
=
useState(true);









useEffect(()=>{


const unsubscribe =


onAuthStateChanged(

auth,

async(currentUser)=>{


if(!currentUser){

router.push("/login");

return;

}



try{


const userDoc =

await getDoc(

doc(

db,

"users",

currentUser.uid

)

);






if(userDoc.exists()){


const data = userDoc.data();



setUser({

name:
data.name ?? "未設定",


email:
currentUser.email ?? "",


address:
data.address ?? "未登録"


});


}









const q = query(

collection(
db,
"rentals"
),


where(
"userId",
"==",
currentUser.uid
),


where(
"status",
"==",
"borrowed"
)

);





const snapshot =

await getDocs(q);



setBorrowCount(
snapshot.size
);





}catch(error){


console.error(error);



}finally{


setLoading(false);


}



}


);



return()=>unsubscribe();



},[router]);











// ログアウト

const handleLogout = async()=>{


try{


await signOut(auth);


router.push("/login");


}catch(error){


console.error(error);


alert(
"ログアウトに失敗しました"
);


}



};









if(loading){


return(

<main className="
flex
min-h-screen
items-center
justify-center
">


<p className="text-gray-700">

読み込み中...

</p>


</main>

);


}









return(


<div className="flex min-h-screen bg-gray-100">

    <Sidebar />

    <main className="flex-1">



<div className="
mx-auto
max-w-6xl
">



<header
  className="
    fixed
    top-0
    left-0
    right-0
    z-40
    bg-gradient-to-r
    from-amber-700
    via-yellow-600
    to-amber-800
    text-white
    shadow-lg
  "
>
 <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 lg:px-8">

    <div className="pl-9 lg:pl-0">

      <h1 className="text-2xl font-bold">
        👤 マイページ
      </h1>

      <p className="text-sm text-yellow-100">
        会員情報・貸出状況を確認できます
      </p>

    </div>

  </div>
</header>


<div className="rounded-2xl bg-white p-8 shadow-lg">

    <div className="mb-6 flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
            👤
        </div>

        <div>

            <h2 className="text-2xl font-bold">
                会員情報
            </h2>

            <p className="text-gray-500">
                登録されている情報です
            </p>

        </div>

    </div>

    <div className="grid gap-5 md:grid-cols-2">

        <div className="rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
                名前
            </p>

            <p className="mt-1 text-lg font-semibold text-black">
                {user?.name}
            </p>

        </div>

        <div className="rounded-xl bg-gray-50 p-5">

            <p className="text-sm text-gray-500">
                メール
            </p>

            <p className="mt-1 text-lg font-semibold break-all text-black">
                {user?.email}
            </p>

        </div>

        <div className="rounded-xl bg-gray-50 p-5 md:col-span-2">

            <p className="text-sm text-gray-500">
                住所
            </p>

            <p className="mt-1 text-lg font-semibold text-black">
                {user?.address}
            </p>

        </div>

    </div>

</div>


<div className="mt-8 rounded-2xl bg-green-600 p-8 text-white shadow-lg">

    <h2 className="text-xl font-bold">
        📖 現在の貸出状況
    </h2>

    <p className="mt-5 text-5xl font-bold">
        {borrowCount}
        <span className="text-2xl">
            /5個
        </span>
    </p>

    <p className="mt-3 text-green-100">
        現在貸出中の商品
    </p>

</div>



</div>


</main>

</div>

);


}