"use client";

import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";



interface Rental {

  id:string;

  bookId:string;

  bookTitle:string;

  userName:string;

  borrowDate:string;

  returnDate?:string;

  status:string;

}






export default function AdminRentalsPage(){



const [rentals,setRentals]
=
useState<Rental[]>([]);



const [loading,setLoading]
=
useState(true);



const [tab,setTab]
=
useState<
"borrowed"|"returned"
>("borrowed");







useEffect(()=>{

fetchRentals();

},[]);








const fetchRentals = async()=>{


try{


const q = query(

collection(
db,
"rentals"
),

orderBy(
"createdAt",
"desc"
)

);



const snapshot =
await getDocs(q);




const list = snapshot.docs.map(doc=>({

id:doc.id,

...(doc.data())

})) as Rental[];





setRentals(list);



}catch(error){


console.error(error);



}finally{


setLoading(false);


}



};











// 返却処理

const returnBook = async(
rental:Rental
)=>{


try{


console.log(
"返却対象",
rental.bookId
);





const bookRef =
doc(
db,
"books",
rental.bookId
);



const bookSnap =
await getDoc(bookRef);






if(!bookSnap.exists()){


alert(
"商品データが存在しません"
);


return;


}






const stock =

Number(
bookSnap.data().stock ?? 0
);







await updateDoc(

bookRef,

{

stock:
stock + 1

}

);









await updateDoc(

doc(
db,
"rentals",
rental.id
),

{


status:
"returned",


returnDate:

new Date()
.toISOString()
.split("T")[0]


}

);







alert(
"返却しました"
);



fetchRentals();





}catch(error){


console.error(
error
);


alert(
"返却失敗"
);


}



};









const displayRentals =

rentals.filter(

(rental)=>

rental.status === tab

);








if(loading){


return(

<p className="p-8">

読み込み中...

</p>

);


}








return(


<main className="
min-h-screen
bg-gray-100
p-8
">



<h1 className="
mb-8
text-3xl
font-bold
text-gray-900
">

📖 貸出管理

</h1>








<div className="
mb-6
flex
gap-4
">


<button

onClick={()=>setTab("borrowed")}

className={`
rounded-lg
px-6
py-3
font-bold
text-white

${
tab==="borrowed"
?
"bg-green-600"
:
"bg-gray-400"
}

`}

>

貸出中

</button>






<button

onClick={()=>setTab("returned")}

className={`
rounded-lg
px-6
py-3
font-bold
text-white

${
tab==="returned"
?
"bg-blue-600"
:
"bg-gray-400"
}

`}

>

返却済

</button>




</div>









<div className="
rounded-lg
bg-white
shadow
overflow-x-auto
">





<table className="
w-full
">



<thead className="
bg-gray-800
text-white
">


<tr>

<th className="p-3 border">
商品名
</th>

<th className="p-3 border">
利用者
</th>

<th className="p-3 border">
貸出日
</th>

<th className="p-3 border">
状態
</th>

</tr>



</thead>






<tbody>


{

displayRentals.length===0

?

<tr>

<td
colSpan={5}
className="
p-8
text-center
text-gray-500
"
>

データがありません

</td>

</tr>



:


displayRentals.map((rental)=>(


<tr
key={rental.id}
>


<td className="
border
p-3
text-gray-900
">

📚 {rental.bookTitle}

</td>




<td className="
border
p-3
text-gray-900
">

👤 {rental.userName}

</td>




<td className="
border
p-3
text-gray-900
">

{rental.borrowDate}

</td>





<td className="border p-3">


{
rental.status==="borrowed"

?

<span className="
font-bold
text-green-600
">

貸出中

</span>


:

<span className="
font-bold
text-blue-600
">

返却済

</span>

}


</td>




</tr>


))


}



</tbody>


</table>



</div>



</main>


);


}