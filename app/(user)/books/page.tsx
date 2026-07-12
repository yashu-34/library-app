"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth
} from "@/firebase/config";

import {
  useCart
} from "@/components/user/CartProvider";



interface Book {

  id:string;

  title:string;

  author:string;

  publisher:string;

  category:string;

  stock:number;

  imageUrl:string;

}



interface Rental {

  bookId:string;

  userId:string;

  status:string;

}






export default function BooksPage(){



const [books,setBooks]
=
useState<Book[]>([]);



const [rentals,setRentals]
=
useState<Rental[]>([]);



const [keyword,setKeyword]
=
useState("");



const [loading,setLoading]
=
useState(true);



const [message,setMessage]
=
useState("");




const {
 cart,
 addCart
}
=
useCart();










useEffect(()=>{


fetchBooks();

fetchUserRentals();


},[]);











// 本取得

const fetchBooks = async()=>{


try{


const snapshot =

await getDocs(

collection(
db,
"books"
)

);



const list:Book[] =


snapshot.docs.map(doc=>({

id:doc.id,

...(doc.data() as Omit<Book,"id">)

}));



setBooks(list);



}catch(error){


console.error(
error
);


}finally{


setLoading(false);


}


};











// ユーザー貸出取得

const fetchUserRentals = async()=>{


const user =
auth.currentUser;



if(!user){

return;

}



try{


const q = query(

collection(
db,
"rentals"
),

where(
"userId",
"==",
user.uid
)

);



const snapshot =

await getDocs(q);



setRentals(

snapshot.docs.map(doc=>

doc.data() as Rental

)

);



}catch(error){


console.error(error);


}



};











// 現在借りている数

const borrowCount =


rentals.filter(

(item)=>

item.status==="borrowed"

).length;











// カート追加

const handleAddCart = async(
book:Book
)=>{



const cartCount = cart.length;



if(
borrowCount + cartCount >= 5
){


setMessage(

"貸出できる本は最大5冊までです"

);


setTimeout(()=>setMessage(""),3000);


return;


}






if(
book.stock <=0
){


setMessage(

"在庫がありません"

);


setTimeout(()=>setMessage(""),3000);


return;


}







await addCart({

id:"",

bookId:book.id,

title:book.title,

author:book.author,

imageUrl:book.imageUrl,

stock:book.stock

});





setMessage(

`${book.title}をカートに追加しました`

);



setTimeout(()=>setMessage(""),3000);



};









const filteredBooks =


books.filter(

(book)=>

book.title.includes(keyword)

||

book.author.includes(keyword)

);










if(loading){


return(

<main className="p-6">

<p>

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
max-w-7xl
">







<header className="
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

📚 本一覧

</h1>






<Link

href="/cart"

className="
flex
items-center
justify-center
rounded-lg
bg-green-600
px-5
py-3
font-bold
text-white
"

>

🛒 カート

<span className="
ml-2
rounded-full
bg-white
px-3
py-1
text-green-700
">

{cart.length}

</span>


</Link>



</header>









{
message &&


<div className="
mb-5
rounded-lg
bg-blue-600
p-4
font-bold
text-white
">

✅ {message}

</div>


}









<input

placeholder="
タイトル・著者で検索
"

value={keyword}

onChange={(e)=>

setKeyword(
e.target.value
)

}

className="
mb-6
w-full
rounded-lg
border
bg-white
p-4
text-gray-900
"

/>









<div className="
grid
grid-cols-1
gap-5
sm:grid-cols-2
lg:grid-cols-4
">







{

filteredBooks.map((book)=>(



<div

key={book.id}

className="
rounded-xl
bg-white
p-5
shadow
"

>







<div className="
flex
justify-center
">


<Image

src={
book.imageUrl ||
"/images/no-image.png"
}

alt={book.title}

width={150}

height={220}

className="
rounded-lg
object-cover
"

/>


</div>








<h2 className="
mt-4
text-lg
font-bold
text-gray-900
">

{book.title}

</h2>








<p className="
mt-2
text-gray-700
">

著者：
{book.author}

</p>









<p className={`
mt-3
font-bold

${
book.stock > 0

?

"text-green-600"

:

"text-red-600"

}

`}>

貸出可能：

{book.stock}

冊

</p>









<Link

href={`/books/${book.id}`}

className="
mt-4
block
rounded-lg
bg-blue-600
p-3
text-center
font-bold
text-white
"

>

詳細を見る

</Link>








<button


disabled={
book.stock <=0
}



onClick={()=>handleAddCart(book)}


className="
mt-3
w-full
rounded-lg
bg-green-600
p-3
font-bold
text-white
disabled:bg-gray-400
"

>


{

book.stock >0

?

"🛒 カートへ追加"

:

"在庫なし"

}


</button>







</div>



))


}



</div>






</div>


</main>


);


}