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


<main className="
min-h-screen
bg-gray-100
p-4
sm:p-6
md:p-8
">



<div className="
mx-auto
max-w-6xl
">







{/* ヘッダー */}

<div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-amber-800 via-yellow-700 to-amber-900 text-white shadow-2xl">

  <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between">

    {/* 左側 */}
    <div>

      <div className="flex items-center gap-3">

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-4xl backdrop-blur">
          📚
        </div>

        <div>
          <h1 className="text-3xl font-bold">
            Library Management
          </h1>

          <p className="text-yellow-100">
            図書館貸出システム
          </p>
        </div>

      </div>

      <div className="mt-6">

        <p className="text-2xl font-semibold">
          ようこそ、{user?.name}さん 👋
        </p>

        <p className="mt-2 max-w-xl text-yellow-100">
          商品を検索したり、
          現在の貸出状況や貸出履歴を
          確認できます。
        </p>

      </div>

    </div>

    {/* 右側 */}
    <div className="space-y-4 text-center">

      <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">

        <p className="text-sm text-yellow-100">
          今日の日付
        </p>

        <p className="mt-1 text-xl font-bold">
          {new Date().toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>

      </div>

      <button
        onClick={handleLogout}
        className="w-full rounded-xl bg-red-600 px-6 py-3 font-bold transition hover:bg-red-700"
      >
        🚪 ログアウト
      </button>

    </div>

  </div>

</div>





{/* 貸出状況 */}

<div className="
mb-6
rounded-xl
bg-green-600
p-5
text-white
sm:p-6
">


<h2 className="
text-lg
font-bold
">

📖 現在の貸出状況

</h2>



<p className="
mt-3
text-4xl
font-bold
">

{borrowCount}

<span className="
text-xl
">

/ 5冊

</span>


</p>



<p className="
mt-2
">

現在借りている商品

</p>



</div>









{/* メニュー */}

<div className="
grid
gap-4
sm:grid-cols-2
lg:grid-cols-3
">







<Link

href="/books"

className="
rounded-xl
bg-white
p-5
shadow
transition
hover:bg-blue-50
"

>


<div className="
text-5xl
">

📚

</div>



<h2 className="
mt-4
text-xl
font-bold
text-gray-900
">

商品を探す

</h2>



<p className="
mt-2
text-gray-600
">

商品を検索して借りる

</p>



</Link>









<Link

href="/rentals"

className="
rounded-xl
bg-white
p-5
shadow
transition
hover:bg-green-50
"

>


<div className="
text-5xl
">

📖

</div>



<h2 className="
mt-4
text-xl
font-bold
text-gray-900
">

貸出履歴

</h2>



<p className="
mt-2
text-gray-600
">

借りている本を確認

</p>



</Link>









<Link

href="/profile"

className="
rounded-xl
bg-white
p-5
shadow
transition
hover:bg-yellow-50
"

>


<div className="
text-5xl
">

👤

</div>



<h2 className="
mt-4
text-xl
font-bold
text-gray-900
">

マイページ

</h2>



<p className="
mt-2
text-gray-600
">

登録情報を変更

</p>



</Link>








</div>









{/* ステータス */}

<div className="
mt-8
grid
gap-4
sm:grid-cols-3
">



<div className="
rounded-xl
bg-blue-600
p-5
text-white
">

<h2 className="font-bold">

📚 貸出可能

</h2>


<p className="
mt-3
text-2xl
font-bold
">

検索

</p>


</div>







<div className="
rounded-xl
bg-green-600
p-5
text-white
">

<h2 className="font-bold">

📖 利用状況

</h2>


<p className="
mt-3
text-2xl
font-bold
">

{borrowCount}冊

</p>


</div>







<div className="
rounded-xl
bg-orange-500
p-5
text-white
">

<h2 className="font-bold">

👤 会員情報

</h2>


<p className="
mt-3
text-2xl
font-bold
">

確認

</p>


</div>







</div>







</div>


</main>


);


}