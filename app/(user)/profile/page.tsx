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

<div className="
mb-6
flex
flex-col
gap-4
sm:flex-row
sm:items-center
sm:justify-between
">


<h1 className="
text-2xl
font-bold
text-gray-900
sm:text-3xl
">

📚 利用者ダッシュボード

</h1>





<button

onClick={handleLogout}

className="
rounded-lg
bg-red-600
px-5
py-3
font-bold
text-white
hover:bg-red-700
"

>

🚪 ログアウト

</button>


</div>










{/* ユーザー情報 */}

<div className="
mb-6
rounded-xl
bg-white
p-5
shadow
sm:p-6
">


<h2 className="
mb-4
text-xl
font-bold
text-blue-600
">

👤 会員情報

</h2>





<div className="
space-y-2
text-gray-800
">


<p>

<strong>
名前：
</strong>

{user?.name}

</p>



<p>

<strong>
メール：
</strong>

{user?.email}

</p>




<p>

<strong>
住所：
</strong>

{user?.address}

</p>



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

現在借りている本

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

本を探す

</h2>



<p className="
mt-2
text-gray-600
">

本を検索して借りる

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