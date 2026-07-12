"use client";

import { useCart } from "@/components/user/CartProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

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




const currentBorrowCount =
rentalSnapshot.size;





if(
currentBorrowCount + cart.length > 5
){


alert(

`現在${currentBorrowCount}個借りています。最大5冊までです。`

);


return;


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


<main className="
min-h-screen
bg-gray-100
p-4
md:p-10
">


<div className="
mx-auto
max-w-4xl
">






<h1 className="
mb-6
text-2xl
font-bold
text-gray-900
md:text-3xl
">

🛒 貸出カート

</h1>








{
userName &&


<div className="
mb-6
rounded-lg
bg-blue-100
p-4
font-bold
text-blue-800
">


👤 利用者：

{userName}


</div>


}









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
gap-4
rounded-lg
bg-white
p-5
shadow

md:flex-row
md:items-center
md:justify-between
"

>


<div>


<h2 className="
text-lg
font-bold
text-gray-900
">


📚 {book.title}


</h2>




<p className="
text-sm
text-gray-500
">


著者：

{book.author}


</p>



</div>






<button

onClick={()=>removeCart(book.id)}

className="
w-full
rounded-lg
bg-red-100
px-4
py-3
font-bold
text-red-600
hover:bg-red-200

md:w-auto
"

>


削除


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

href="/books"

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


);


}