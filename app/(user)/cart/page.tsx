"use client";

import { useCart } from "@/components/user/CartProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/common/Sidebar";
import Image from "next/image";

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import {
  db,
  auth
} from "@/firebase/config";


import {
  onAuthStateChanged
} from "firebase/auth";

import {
  useEffect,
  useState
} from "react";





export default function CartPage() {


const router = useRouter();


const {
  cart,
  removeCart
}=useCart();




const [userName,setUserName]
=
useState("");






useEffect(()=>{


const unsubscribe =

onAuthStateChanged(

auth,

async(user)=>{


if(!user){

setUserName("");

return;

}




const userSnap =

await getDoc(

doc(
db,
"users",
user.uid
)

);




if(userSnap.exists()){


setUserName(

userSnap.data().name

);


}



}


);



return()=>unsubscribe();



},[]);











const borrowBooks = async()=>{


const user =
auth.currentUser;



if(!user){

alert(
"ログインしてください"
);

return;

}




if(cart.length===0){

alert(
"借りる本を選択してください"
);

return;

}





try{


const rentalQuery = query(

collection(
db,
"rentals"
),


where(
"userId",
"==",
user.uid
),


where(
"status",
"==",
"borrowed"
)


);





const rentalSnapshot =
await getDocs(
rentalQuery
);




rentalSnapshot.size;


// 同じ商品の個数をチェック
const bookCountMap: Record<string, number> = {};

for (const book of cart) {
  bookCountMap[book.bookId] = (bookCountMap[book.bookId] || 0) + 1;

  if (bookCountMap[book.bookId] > 5) {
    alert(`「${book.title}」は同じ商品を5個までしか貸出できません。`);
    return;
  }
}



for(
const book of cart
){



const bookRef =
doc(
db,
"books",
book.bookId
);



const bookSnap =
await getDoc(
bookRef
);



if(!bookSnap.exists()){

continue;

}




const stock =
bookSnap.data().stock ?? 0;




if(stock<=0){


alert(
`${book.title}は在庫切れです`
);


continue;


}








await addDoc(

collection(
db,
"rentals"
),

{


bookId:
book.bookId,


bookTitle:
book.title,


userId:
user.uid,


userName:
userName,


borrowDate:

new Date()
.toISOString()
.split("T")[0],


returnDate:"",


status:"borrowed",


createdAt:
serverTimestamp()


}


);







await updateDoc(

bookRef,

{

stock:
stock-1

}

);







await removeCart(

book.id

);



}





alert(
`${userName}さんの貸出完了しました`
);



router.push("/rentals");





}catch(error){


console.error(error);


alert(
"貸出に失敗しました"
);


}



};











return(


<div className="flex min-h-screen bg-gray-100 lg:ml-72">

    <Sidebar />

    <main className="flex-1">

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

    {/* 左側 */}
    <div className="pl-12 lg:pl-0">

      <h1 className="text-2xl font-bold">
        🛒 貸出カート
      </h1>

      <p className="text-sm text-yellow-100">
        貸出する商品を確認してください
      </p>

    </div>

    {/* 商品一覧へ戻る */}
    <Link
      href="/books"
      className="
        rounded-xl
        bg-blue-600
        px-5
        py-3
        font-bold
        transition
        hover:bg-blue-700
      "
    >
      📚 商品一覧
    </Link>

  </div>
</header>


<div className="mx-auto mt-28 max-w-5xl p-6">


{
cart.length===0 ?



<div className="
rounded-lg
bg-white
p-8
text-center
shadow
">


<p className="
text-gray-500
">

カートに商品がありません

</p>


</div>

:



<div className="
space-y-4
">


{

cart.map((book)=>(


<div
  key={book.id}
  className="
    flex
    flex-col
    gap-5
    rounded-2xl
    bg-white
    p-5
    shadow
    md:flex-row
    md:items-center
    md:justify-between
  "
>

  {/* 商品画像 */}
  <div className="flex justify-center md:w-40">

    <Image
      src={book.imageUrl || "/images/no-image.png"}
      alt={book.title}
      width={120}
      height={120}
      className="h-32 w-auto rounded-lg object-contain"
    />

  </div>

  {/* 商品情報 */}
  <div className="flex-1">

    <h2 className="text-xl font-bold text-gray-900">
      📚 {book.title}
    </h2>

    <p className="mt-2 text-gray-500">
      販売名
    </p>

    <p className="font-semibold text-gray-800">
      {book.author}
    </p>

  </div>

  {/* 削除ボタン */}
  <button
    onClick={() => removeCart(book.id)}
    className="
      rounded-xl
      bg-red-100
      px-6
      py-3
      font-bold
      text-red-600
      transition
      hover:bg-red-200
    "
  >
    🗑 削除
  </button>

</div>


))


}



</div>


}









{
cart.length>0 &&



<div className="
mt-8
rounded-lg
bg-white
p-5
shadow
">


<div className="
flex
flex-col
gap-4

md:flex-row
md:items-center
md:justify-between
">





<p className="
text-lg
font-bold
text-gray-900
">

合計 {cart.length}個

</p>






<button

onClick={borrowBooks}

className="
w-full
rounded-lg
bg-green-600
py-3
font-bold
text-white
hover:bg-green-700

md:w-auto
md:px-8
"

>


📖 まとめて借りる


</button>



</div>


</div>


}








<Link

href="/product_search"

className="
mt-6
block
w-full
rounded-lg
bg-gray-600
py-3
text-center
font-bold
text-white
hover:bg-gray-700
"

>


← 商品一覧へ戻る


</Link>








</div>


</main>

</div>

);


}