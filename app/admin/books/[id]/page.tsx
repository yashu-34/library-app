"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import {
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "@/firebase/config";

import { Book } from "@/app/types/books";



export default function BookDetailPage() {


const params = useParams();

const router = useRouter();


const id =
params.id as string;




const [book,setBook]
=
useState<Book|null>(null);



const [loading,setLoading]
=
useState(true);



const [isAdmin,setIsAdmin]
=
useState(false);








// 権限確認

useEffect(()=>{


const unsubscribe =

onAuthStateChanged(

auth,

async(user)=>{


if(!user){

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




if(
userSnap.exists()
){

const userData =
userSnap.data();


if(
userData.role === "admin"
){

setIsAdmin(true);

}


}



}

);



return()=>unsubscribe();



},[]);










// 本取得

useEffect(()=>{


const fetchBook = async()=>{


try{


const bookSnap =

await getDoc(

doc(
db,
"books",
id
)

);





if(
!bookSnap.exists()
){


alert(
"商品が見つかりません"
);


router.push("/admin");


return;


}





setBook({

id:
bookSnap.id,

...(bookSnap.data() as Omit<Book,"id">)

});





}catch(error){


console.error(error);


alert(
"取得失敗"
);


}finally{


setLoading(false);


}



};



fetchBook();



},[id,router]);











// 削除

const handleDelete = async()=>{


if(
!isAdmin
){

alert(
"管理者のみ削除できます"
);


return;


}





if(
!confirm(
"この商品を削除しますか？"
)

){

return;

}






try{


await deleteDoc(

doc(
db,
"books",
id
)

);




alert(
"削除しました"
);



router.push(
"/admin/books"
);



}catch(error){


console.error(error);


alert(
"削除失敗"
);


}



};









if(loading){


return(

<main className="p-8">

<p>
読み込み中...
</p>

</main>

);


}





if(!book){

return null;

}








return(


<main className="
mx-auto
max-w-4xl
p-8
">



<h1 className="
mb-8
text-3xl
font-bold
text-gray-900
">

📚 商品の詳細

</h1>







<div className="
rounded-lg
bg-white
p-6
shadow
">





<div className="
flex
flex-col
gap-8
md:flex-row
">






<div className="
flex
justify-center
md:w-1/3
">


<Image

src={
book.imageUrl
?
book.imageUrl
:
"/images/no-image.png"
}

alt={book.title}

width={250}

height={350}

className="
rounded-lg
border
object-cover
"

/>


</div>









<div className="
flex-1
space-y-4
text-gray-900
">



<div>

<p className="font-bold">
タイトル
</p>

<p>
{book.title}
</p>

</div>





<div>

<p className="font-bold">
著者
</p>

<p>
{book.author}
</p>

</div>





<div>

<p className="font-bold">
ISBN
</p>

<p>
{book.isbn}
</p>

</div>





<div>

<p className="font-bold">
出版社
</p>

<p>
{book.publisher}
</p>

</div>





<div>

<p className="font-bold">
出版日
</p>

<p>
{book.publishDate}
</p>

</div>





<div>

<p className="font-bold">
カテゴリ
</p>

<p>
{book.category}
</p>

</div>





<div>

<p className="font-bold">
在庫
</p>

<p>
{book.stock}冊
</p>

</div>




</div>



</div>










<div className="
mt-10
flex
flex-wrap
gap-3
">





{/* 管理者のみ */}

{

isAdmin &&


<>


<Link

href={`/admin/books/${id}/edit`}

className="
rounded
bg-blue-600
px-5
py-2
text-white
hover:bg-blue-700
"

>

✏️ 編集

</Link>





<button

onClick={handleDelete}

className="
rounded
bg-red-600
px-5
py-2
text-white
hover:bg-red-700
"

>

🗑️ 削除

</button>


</>


}








<Link

href="/admin/books"

className="
rounded
bg-gray-600
px-5
py-2
text-white
hover:bg-gray-700
"

>

← 一覧へ戻る

</Link>






</div>





</div>



</main>


);



}