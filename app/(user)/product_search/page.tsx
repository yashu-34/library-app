"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
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
import Header from "@/components/common/Header";

import {
  FaSearch,
  FaFolderOpen,
} from "react-icons/fa";

import { FaArrowRight } from "react-icons/fa";

import {
  HiOutlineShoppingCart,
} from "react-icons/hi";


interface Book {

  id:string;

  title:string;

  author:string;

  publisher:string;

  category:string;

  stock:number;

  imageUrl:string;

  updatedAt?:Timestamp;

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

const [currentPage, setCurrentPage] = useState(1);

const itemsPerPage = 10;

const categories = [...new Set(books.map(book => book.category))];

const router = useRouter();






useEffect(()=>{


fetchBooks();

fetchUserRentals();


},[]);


// 検索・カテゴリが変わったら1ページ目に戻す
useEffect(()=>{

setCurrentPage(1);

},[keyword, selectedCategory]);











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
  // 最大5商品まで
  if (cart.length >= 5) {
    alert("一度にお申込みいただける数量は5包までです。");
    return;
  }

  // 同じ商品は1回まで
  const alreadyInCart = cart.some(
    (item) => item.bookId === book.id
  );

  if (alreadyInCart) {
    alert("このサンプルはお一人様1商品1回までです。");
    return;
  }

  // 在庫チェック
  if (book.stock <= 0) {
    alert("この商品は在庫切れです。");
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

  setMessage(`${book.title}をカートへ追加しました`);

  setTimeout(() => setMessage(""), 3000);

  alert(`${book.title}をカートへ追加しました`);
};


// カート内の商品数を取得
const getCartCount = (bookId:string)=>{

  return cart.filter(
    (item)=>
      item.bookId === bookId
  ).length;

};


// 販売日（updatedAt）が今月かどうか（NEW表示判定）
const isNewThisMonth = (updatedAt?: Timestamp) => {

  if(!updatedAt){
    return false;
  }

  const date = updatedAt.toDate();

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );

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


// ページネーション
const totalPages = Math.max(
  1,
  Math.ceil(filteredBooks.length / itemsPerPage)
);

const paginatedBooks = filteredBooks.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

const handlePageChange = (page: number) => {

  if(page < 1 || page > totalPages){
    return;
  }

  setCurrentPage(page);

  window.scrollTo({ top: 0, behavior: "smooth" });

};




if(loading){


return(

<main className="flex min-h-screen items-center justify-center bg-white lg:ml-72">

  <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">

    <div className="flex flex-col items-center">

      {/* ローディングスピナー */}
      <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-gray-200 border-t-teal-600"></div>

      <h2 className="mt-6 text-base font-semibold tracking-wide text-gray-800">
        商品情報を読み込み中...
      </h2>

      <p className="mt-2 text-xs text-gray-400">
        少々お待ちください
      </p>

    </div>

  </div>

</main>

);

}









return(

<div className="flex min-h-screen bg-white lg:ml-72">

    <Sidebar />

    <main className="flex-1">

        <div className="mx-auto px-0">

{/* ===== ヘッダー ===== */}
<Header cartCount={cart.length} />

{/* ===== 通知メッセージ ===== */}
{
message &&

<div className="mt-20 border-b border-teal-100 bg-teal-50 px-6 py-3 text-sm font-medium text-teal-800">

✓ {message}

</div>

}


{/* ===== 検索 ===== */}
<div className={`${message ? "" : "mt-20"} border-b border-gray-100 bg-white px-6 py-8`}>

  <div className="mb-5 flex items-center gap-3">

    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7FFFD4]/40">
      <FaSearch className="text-sm text-teal-700"/>
    </div>

    <div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">
        Search
      </p>

      <h2 className="text-lg font-bold text-gray-900">
        商品を検索する
      </h2>

    </div>

  </div>

  <div className="relative max-w-xl">

    <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

    <input
      type="text"
      placeholder="商品名・販売名で検索"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      className="
        w-full
        rounded-full
        border
        border-gray-200
        bg-white
        py-3
        pl-11
        pr-4
        text-sm
        text-gray-900
        outline-none
        transition
        placeholder:text-gray-400
        focus:border-teal-500
        focus:ring-2
        focus:ring-teal-100
      "
    />

  </div>

</div>


{/* ===== カテゴリ ===== */}
<div className="border-b border-gray-100 bg-white px-6 py-8">

  <div className="mb-5 flex items-center gap-3">

    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7FFFD4]/40">
      <FaFolderOpen className="text-sm text-teal-700" />
    </div>

    <div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">
        Category
      </p>

      <h2 className="text-lg font-bold text-gray-900">
        カテゴリから探す
      </h2>

    </div>

  </div>

  <div className="flex flex-wrap gap-2">

    {/* すべて */}
    <button
      onClick={() => setSelectedCategory("")}
      className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
        selectedCategory === ""
          ? "border-[#7FFFD4] bg-[#7FFFD4] text-gray-900"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      すべて
    </button>

    {/* カテゴリ一覧 */}
    {categories.map((category) => (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-200 ${
          selectedCategory === category
            ? "border-[#7FFFD4] bg-[#7FFFD4] text-gray-900"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        {category}
      </button>
    ))}

  </div>

</div>


{/* ===== 商品一覧 ===== */}
<div className="bg-white px-6 py-8">

  <p className="mb-5 text-sm text-gray-500">
    {filteredBooks.length}件の商品
    {
      totalPages > 1 &&
      `（${(currentPage - 1) * itemsPerPage + 1}〜${Math.min(currentPage * itemsPerPage, filteredBooks.length)}件を表示）`
    }
  </p>

  <div
    className="
      grid
      grid-cols-2
      gap-x-4
      gap-y-8
      sm:grid-cols-2
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
    "
  >


  {

  paginatedBooks.map((book)=>(



  <div
    key={book.id}
    className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-colors duration-200 hover:border-teal-200"
  >
    {/* 商品画像 */}
    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-50">

      {/* カテゴリ */}
      <span
        className="
          absolute
          left-3
          top-3
          rounded-full
          bg-white
          px-3
          py-1
          text-[11px]
          font-semibold
          text-teal-700
          shadow-sm
        "
      >
        {book.category}
      </span>

      {/* NEW */}
      {
        isNewThisMonth(book.updatedAt) &&

        <span
          className="
            absolute
            right-3
            top-3
            rounded-full
            bg-red-500
            px-3
            py-1
            text-[11px]
            font-semibold
            text-white
            shadow-sm
          "
        >
          NEW
        </span>
      }

      <Image
        src={book.imageUrl || "/images/no-image.png"}
        alt={book.title}
        width={220}
        height={220}
        className="h-40 w-40 object-contain transition-transform duration-300 group-hover:scale-105"
      />

    </div>

    {/* 商品情報 */}
    <div className="flex flex-1 flex-col p-4">

      {/* 商品名 */}
      <h2 className="h-12 line-clamp-2 text-sm font-bold leading-snug text-gray-900">
        {book.title}
      </h2>

      {/* 販売名 */}
      <div className="mt-2 h-10">
        <p className="text-[11px] text-gray-400">
          販売名
        </p>

        <p className="mt-0.5 line-clamp-1 text-xs font-medium text-gray-600">
          {book.author}
        </p>
      </div>

      {/* 在庫 */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">

        <span className="text-xs text-gray-400">
          在庫状況
        </span>


        {
          (() => {

            // カートに入っている数
            const cartCount = cart.filter(
              (item) =>
                item.bookId === book.id
            ).length;


            // 実際に表示する残り在庫
            const remainingStock =
              book.stock - cartCount;



            return (

              <span
                className={`text-xs font-bold ${
                  remainingStock > 0
                    ? "text-teal-700"
                    : "text-red-500"
                }`}
              >

                {
                  remainingStock > 0
                    ? `残り ${remainingStock}個`
                    : "在庫なし"
                }

              </span>

            );


          })()
        }


      </div>

      {/* ボタン */}
      <div className="mt-auto space-y-2 pt-4">

        <Link
          href={`/product_search/${book.id}`}
          className="flex items-center justify-center gap-1.5 rounded-full border border-teal-700 py-2.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
        >
          <span>詳細を見る</span>

          <FaArrowRight className="text-[10px]"/>
        </Link>


        <button
          disabled={
            book.stock -
            cart.filter(
              (item) => item.bookId === book.id
            ).length
            <= 0
          }
          onClick={() => handleAddCart(book)}
          className="
            w-full
            rounded-full
            bg-teal-700
            py-2.5
            text-xs
            font-semibold
            text-white
            transition
            hover:bg-teal-800
            disabled:bg-gray-200
            disabled:text-gray-400
          "
        >
          {
            book.stock -
            cart.filter(
              (item) => item.bookId === book.id
            ).length > 0 ? (

              <div className="flex items-center justify-center gap-1.5">
                <HiOutlineShoppingCart className="text-sm" />
                <span>カートへ追加</span>
              </div>

            ) : (

              <span>在庫なし</span>

            )
          }
        </button>

      </div>

    </div>
  </div>


  ))

  }

  </div>

  {/* ===== ページネーション ===== */}
  {
    totalPages > 1 &&

    <div className="mt-10 flex items-center justify-center gap-2">

      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="
          rounded-full
          border
          border-gray-200
          px-4
          py-2
          text-sm
          font-medium
          text-gray-600
          transition
          hover:bg-gray-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        前へ
      </button>

      <div className="flex items-center gap-1">

        {
          Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (

            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-sm
                font-semibold
                transition-colors
                duration-200
                ${
                  currentPage === page
                    ? "bg-[#7FFFD4] text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }
              `}
            >
              {page}
            </button>

          ))
        }

      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="
          rounded-full
          border
          border-gray-200
          px-4
          py-2
          text-sm
          font-medium
          text-gray-600
          transition
          hover:bg-gray-50
          disabled:cursor-not-allowed
          disabled:opacity-40
        "
      >
        次へ
      </button>

    </div>
  }

</div>






</div>


</main>

</div>


);


}