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

import Sidebar from "@/components/common/Sidebar";


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









const handleAddCart = async (book: Book) => {

  // 現在カートに入っている同じ商品の数
  const sameBookCount = cart.filter(
    (item) => item.bookId === book.id
  ).length;

  // 全体で借りられる数（貸出中 + カート）
  const totalCount = borrowCount + cart.length;

  // 全体5個まで
  if (totalCount >= 5) {

    setMessage("借りられる商品は合計5個までです");

    setTimeout(() => setMessage(""), 3000);

    return;
  }

  // 同じ商品は5個まで
  if (sameBookCount >= 5) {

    setMessage("同じ商品は5個までです");

    setTimeout(() => setMessage(""), 3000);

    return;
  }

  // 在庫以上は追加不可
  if (sameBookCount >= book.stock) {

    setMessage("在庫以上は追加できません");

    setTimeout(() => setMessage(""), 3000);

    return;
  }

  await addCart({
    id: crypto.randomUUID(),
    bookId: book.id,
    title: book.title,
    author: book.author,
    imageUrl: book.imageUrl,
    stock: book.stock,
  });

  setMessage(`${book.title}をカートに追加しました`);
  alert(`${book.title}をカートに追加しました`);

  setTimeout(() => setMessage(""), 3000);
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

<div className="flex min-h-screen bg-gray-100">

    <Sidebar />

    <main className="flex-1">

        <div className="mx-auto  px-0">

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
  <div className="mx-auto flex h-25 max-w-7xl items-center justify-between px-4 lg:px-8">

    {/* 左側 */}
    <div className="flex items-center gap-3">

      {/* Sidebar.tsx のハンバーガーボタンと重ならないようにスマホだけ余白 */}
      <div className="pl-12 lg:pl-0 flex items-center gap-3">

        <div className="flex h-12 w-12 text-2xl items-center justify-center rounded-full bg-white/20 text-xl">
          📦
        </div>

        <div>
          <h1 className="text-lg font-bold sm:text-xl">
            商品貸出システム
          </h1>

          <p className="hidden text-xs text-yellow-100 sm:block">
            商品の検索・貸出・在庫確認ができます。
          </p>
        </div>

      </div>

    </div>

    {/* 右側 */}
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
        transition
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









{/* 検索 */}
<div className="mt-24 mb-8 rounded-2xl bg-white p-6 shadow-lg">

  <div className="mb-5 flex items-center gap-3">

    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
      🔍
    </div>

    <div>

      <h2 className="text-xl font-bold text-gray-900">
        商品検索
      </h2>

      <p className="text-sm text-gray-500">
        商品名または販売名で検索できます
      </p>

    </div>

  </div>

  <div className="relative">

    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400">
      🔍
    </span>

    <input
      type="text"
      placeholder="タイトル・販売名で検索"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      className="
        w-full
        rounded-xl
        border
        border-gray-300
        bg-gray-50
        py-4
        pl-12
        pr-4
        text-gray-900
        outline-none
        transition
        focus:border-blue-500
        focus:bg-white
        focus:ring-4
        focus:ring-blue-100
      "
    />

  </div>

</div>


{/* カテゴリ */}
<div className="mb-10 rounded-2xl bg-white p-6 shadow-lg">

  <div className="mb-6 flex items-center gap-3">

    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
      📂
    </div>

    <div>

      <h2 className="text-xl font-bold text-gray-900">
        カテゴリから探す
      </h2>

      <p className="text-sm text-gray-500">
        カテゴリを選択して商品を絞り込みできます
      </p>

    </div>

  </div>

  <div className="flex flex-wrap gap-3">

    {/* すべて */}
    <button
      onClick={() => setSelectedCategory("")}
      className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
        selectedCategory === ""
          ? "bg-blue-600 text-white shadow-md"
          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      すべて
    </button>

    {/* カテゴリ一覧 */}
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
          selectedCategory === category
            ? "bg-blue-600 text-white shadow-md"
            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
        }`}
      >
        {category}
      </button>
    ))}

  </div>

</div>


<div
  className="
    grid
    justify-center
    grid-cols-2
    gap-4
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-4
    xl:grid-cols-5
    2xl:grid-cols-6
  "
>


{

filteredBooks.map((book)=>(



<div
  key={book.id}
  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
>
  {/* 商品画像 */}
  <div className="relative flex h-40 items-center justify-center bg-gray-100">

    {/* カテゴリ */}
    <span
      className="
        absolute
        left-3
        top-3
        rounded-full
        bg-amber-600
        px-3
        py-1
        text-xs
        font-bold
        text-white
        shadow
      "
    >
      {book.category}
    </span>

    <Image
      src={book.imageUrl || "/images/no-image.png"}
      alt={book.title}
      width={140}
      height={180}
      className="h-full w-auto object-contain"
    />

  </div>

  {/* 商品情報 */}
  <div className="p-5">

    {/* 商品名 */}
    <h2 className="line-clamp-2 text-lg font-bold text-gray-900">
      {book.title}
    </h2>

    {/* 販売名 */}
    <p className="mt-2 text-sm text-gray-500">
      販売名
    </p>

    <p className="font-medium text-gray-800">
      {book.author}
    </p>

    {/* 在庫 */}
    <div className="mt-4 flex items-center justify-between">

      <span className="text-sm text-gray-500">
        在庫状況
      </span>

      <span
        className={`rounded-full px-3 py-1 text-sm font-bold ${
          book.stock > 0
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {book.stock > 0
          ? `残り ${book.stock}個`
          : "在庫なし"}
      </span>

    </div>

    {/* ボタン */}
    <div className="mt-6 space-y-3">

      <Link
        href={`/books/${book.id}`}
        className="block rounded-xl bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
      >
        詳細を見る
      </Link>

      <button
        disabled={book.stock <= 0}
        onClick={() => handleAddCart(book)}
        className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:bg-gray-300"
      >
        {book.stock > 0
          ? "🛒 カートへ追加"
          : "在庫なし"}
      </button>

    </div>

  </div>
</div>


))


}



</div>






</div>


</main>

</div>


);


}