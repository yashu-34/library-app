"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  db,
  auth
} from "@/firebase/config";



export interface CartItem {

  id:string;

  bookId:string;

  title:string;

  author:string;

  imageUrl:string;

  stock:number;

}



interface CartContextType {


  cart:CartItem[];


  addCart:
  (
    book:CartItem
  )=>Promise<void>;



  removeCart:
  (
    id:string
  )=>Promise<void>;


}




const CartContext =
createContext<CartContextType | null>(null);





export function CartProvider({
children
}:{
children:ReactNode;
}){


const [
cart,
setCart
]=useState<CartItem[]>([]);







const fetchCart = async(
uid:string
)=>{


const snapshot =
await getDocs(

collection(
db,
"users",
uid,
"cart"
)

);



const list =
snapshot.docs.map(doc=>({

id:doc.id,

...(doc.data() as Omit<CartItem,"id">)

}));


setCart(
list
);


};






useEffect(()=>{


const unsubscribe =
onAuthStateChanged(
auth,
(user)=>{


if(user){

fetchCart(
user.uid
);

}else{

setCart([]);

}


});


return()=>unsubscribe();


},[]);









// カート追加

const addCart = async(
book:CartItem
)=>{


const user =
auth.currentUser;



if(!user){

alert(
"ログインしてください"
);

return;

}




// 合計5冊制限

if(cart.length >=5){

alert(
"借りられる本は5冊までです"
);

return;

}






await addDoc(

collection(
db,
"users",
user.uid,
"cart"
),

{

bookId:book.bookId,

title:book.title,

author:book.author,

imageUrl:book.imageUrl,

stock:book.stock,

addedAt:
serverTimestamp()

}


);



await fetchCart(
user.uid
);


};








// 削除

const removeCart = async(
id:string
)=>{


const user =
auth.currentUser;


if(!user)
return;



await deleteDoc(

doc(
db,
"users",
user.uid,
"cart",
id

)

);



await fetchCart(
user.uid
);



};







return(

<CartContext.Provider

value={{

cart,

addCart,

removeCart

}}

>


{children}


</CartContext.Provider>

);


}






export function useCart(){


const context =
useContext(
CartContext
);



if(!context){

throw new Error(
"useCartはCartProvider内で使用してください"
);

}


return context;


}