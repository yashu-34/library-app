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

import { useRouter } from "next/navigation";



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


const [selectedCategory, setSelectedCategory] = useState("");


const categories = [...new Set(books.map(book => book.category))];


const categoryIcons: Record<string, string> = {
  "極くすり湯": "📚",
  "伝統薬湯": "📰",
  "素材良湯": "💻",
  "ビューティーバス": "👨‍💻",
  "アロマティックバス": "🏯",
  "シーズンバス": "⚽",
  "企画商品　７種類": "🍳",
};

const router = useRouter();






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

"借りられる個数は最大5個までです"

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









const filteredBooks = books.filter((book) => {
  const matchKeyword =
    book.title.includes(keyword) ||
    book.author.includes(keyword);

  const matchCategory =
    selectedCategory === "" ||
    book.category === selectedCategory;

  return matchKeyword && matchCategory;
});




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


<header className="mb-8 flex items-center justify-between">

  <div className="flex items-center gap-4">

    <button
      onClick={() => router.push("/dashboard")}
      className="rounded-xl bg-white px-4 py-3 shadow transition hover:bg-gray-100"
    >
      ← ホーム
    </button>

    <h1 className="text-3xl font-bold text-gray-900">
      📚 商品検索
    </h1>

  </div>

  <Link
    href="/cart"
    className="flex items-center rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow hover:bg-green-700"
  >
    🛒 カート

    <span className="ml-3 rounded-full bg-white px-3 py-1 text-green-700">
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


<div className="mb-10">
  <h2 className="mb-5 flex items-center gap-2 text-2xl font-bold text-gray-800">
    📚 カテゴリから探す
  </h2>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    <button
      onClick={() => setSelectedCategory("")}
      className={`
      rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
      ${
        selectedCategory === ""
          ? "border-blue-600 bg-blue-600 text-black"
          : "bg-white"
      }
      `}
    >
      <div className="mb-3 text-4xl">📚</div>
      <p className="font-bold text-black">すべて</p>
    </button>

    {categories.map((category) => (
    <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`
        rounded-2xl
        border
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        ${
            selectedCategory === category
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-gray-200 bg-white text-gray-800 hover:bg-blue-50"
        }
        `}
    >
        <div className="mb-3 text-4xl">
        {categoryIcons[category]}
        </div>

        <p
        className={`font-bold ${
            selectedCategory === category
            ? "text-white"
            : "text-gray-800"
        }`}
        >
        {category}
        </p>
    </button>
    ))}
  </div>
</div>



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

個

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