"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { auth, db } from "@/firebase/config";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";


import {
  useCart
} from "@/components/user/CartProvider";

import Sidebar from "@/components/common/Sidebar";





interface Book {

  title:string;

  author:string;

  publisher:string;

  isbn:string;

  category:string;

  publishDate:string;

  imageUrl:string;

  stock:number;

}








export default function BookDetailPage(){



const params = useParams();

const router = useRouter();


const id =
params.id as string;



const {
  cart,
  addCart
} = useCart();





const [book,setBook]
=
useState<Book|null>(null);



const [loading,setLoading]
=
useState(true);



const [borrowCount,setBorrowCount]
=
useState(0);








// =======================
// ログイン確認
// =======================

useEffect(()=>{


const unsubscribe =

onAuthStateChanged(

auth,

async(user)=>{


if(!user){

router.push("/login");

return;

}




// 管理者チェック

const userSnap =

await getDoc(

doc(
db,
"users",
user.uid
)

);



if(userSnap.exists()){


const role =
userSnap.data().role;



if(role==="admin"){


router.push("/admin");


return;


}



}






// 現在借りている冊数取得

const q = query(

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



const snapshot =
await getDocs(q);



setBorrowCount(
snapshot.size
);



}



);



return()=>unsubscribe();



},[router]);












// =======================
// 本取得
// =======================


useEffect(()=>{


const fetchBook = async()=>{


try{


const snapshot =

await getDoc(

doc(
db,
"books",
id
)

);





if(!snapshot.exists()){


alert(
"本が存在しません"
);


router.push("/books");


return;


}





setBook(

snapshot.data() as Book

);



}catch(error){


console.error(error);



}finally{


setLoading(false);


}



};



fetchBook();



},[id,router]);











// カート内同じ本数

const cartBookCount =

cart.filter(

(item)=>

item.bookId===id

).length;







// カート込み残り在庫

const remainingStock =

book

?

Math.max(

book.stock - cartBookCount,

0

)

:

0;












// =======================
// カート追加
// =======================


const handleAddCart = async()=>{


if(!book){

return;

}





// 在庫確認

if(
remainingStock <=0
){


alert(
"在庫がありません"
);


return;


}






await addCart({


id:"",


bookId:id,


title:book.title,


author:book.author,


imageUrl:book.imageUrl,


stock:book.stock


});





alert(

`${book.title}をカートへ追加しました`

);



};










if(
loading ||
!book
){


return(

<main className="
flex
min-h-screen
items-center
justify-center
">

<p>
読み込み中...
</p>


</main>

);


}










return(


<div className="flex min-h-screen bg-gray-100">

  <Sidebar />

  <main className="flex-1">

    {/* ヘッダー */}
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

        <div className="pl-12 lg:pl-0">

          <h1 className="text-2xl font-bold">
            📦 商品詳細
          </h1>

          <p className="text-sm text-yellow-100">
            商品情報を確認できます
          </p>

        </div>

        <Link
          href="/cart"
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-green-600
            px-4
            py-2
            font-bold
            hover:bg-green-700
          "
        >
          🛒

          <span className="rounded-full bg-white px-2 py-1 text-green-700">
            {cart.length}
          </span>

        </Link>

      </div>

    </header>



<div className="
mt-20
mx-auto
max-w-5xl
rounded-lg
bg-white
p-5
shadow
md:p-8
">





<div className="
grid
gap-8
md:grid-cols-2
">







{/* 画像 */}

<div className="
flex
justify-center
">


{

book.imageUrl

?

<Image

src={book.imageUrl}

alt={book.title}

width={250}

height={350}

className="
h-auto
w-48
rounded-lg
border
md:w-[250px]
"

/>


:

<div className="
flex
h-[280px]
w-[200px]
items-center
justify-center
bg-gray-200
">

No Image

</div>


}



</div>









{/* 詳細 */}

<div>


<h1 className="
mb-5
text-2xl
font-bold
text-gray-900
md:text-3xl
">

{book.title}

</h1>






<div className="
space-y-3
text-gray-800
">


<p>

<strong>
販売名：
</strong>

{book.author}

</p>



<p>

<strong>
説明：
</strong>

{book.isbn}

</p>



<p>

<strong>
カテゴリ：
</strong>

{book.category}

</p>



<p>

<strong>
販売日：
</strong>

{book.publishDate}

</p>



</div>








<p className={`
mt-6
text-xl
font-bold

${
remainingStock>0

?

"text-green-600"

:

"text-red-600"

}

`}>



貸出可能：

{remainingStock}

個



</p>






<button

onClick={handleAddCart}

disabled={
remainingStock<=0
}

className="
mt-6
w-full
rounded-lg
bg-green-600
py-3
text-base
font-bold
text-white
hover:bg-green-700
disabled:bg-gray-400
md:text-lg
"

>



{

remainingStock<=0

?

"在庫なし"

:

"🛒 カートへ追加"

}


</button>



<Link

href="/cart"

className="
mt-3
block
w-full
rounded-lg
bg-blue-600
py-3
text-center
font-bold
text-white
hover:bg-blue-700
"

>


🛒 カートを見る

({cart.length})


</Link>


<Link

href="/books"

className="
mt-3
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



</div>



</div>



</main>

</div>

);



}