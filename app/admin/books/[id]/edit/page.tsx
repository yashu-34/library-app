"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import {
  auth,
  db
} from "@/firebase/config";

import ImageUploader from "@/components/common/ImageUploader";

import Image from "next/image";



export default function EditBookPage() {


const router = useRouter();

const params = useParams();

const id = params.id as string;



const [loading,setLoading]
=
useState(true);


const [saving,setSaving]
=
useState(false);



const [imageFile,setImageFile]
=
useState<File|null>(null);




const [isAdmin,setIsAdmin]
=
useState(false);






const [book,setBook]
=
useState({

title:"",
author:"",
isbn:"",
publisher:"",
publishDate:"",
category:"",
imageUrl:"",
stock:1,

});










// 管理者確認

useEffect(()=>{


const unsubscribe =

onAuthStateChanged(

auth,

async(user)=>{


if(!user){

router.push("/login");

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
!userSnap.exists()
){

alert(
"ユーザー情報がありません"
);

router.push("/");

return;

}





const userData =
userSnap.data();





if(
userData.role !== "admin"
){

alert(
"管理者権限がありません"
);


router.push("/");


return;


}





setIsAdmin(true);




fetchBook();



}


);



return()=>unsubscribe();



},[]);











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





if(!bookSnap.exists()){


alert(
"本がありません"
);


router.push("/admin/books");


return;


}




const data =
bookSnap.data();




setBook({

title:data.title ?? "",

author:data.author ?? "",

isbn:data.isbn ?? "",

publisher:data.publisher ?? "",

publishDate:data.publishDate ?? "",

category:data.category ?? "",

imageUrl:data.imageUrl ?? "",

stock:data.stock ?? 1,


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











// 更新

const updateBook = async()=>{


try{


setSaving(true);



let imageUrl =
book.imageUrl;





if(imageFile){


const formData =
new FormData();


formData.append(
"file",
imageFile
);




const response =

await fetch(
"/api/upload",
{

method:"POST",

body:formData

}

);





const data =
await response.json();





if(!response.ok){


alert(
data.message
);


return;


}





imageUrl =
data.imageUrl;



}







await updateDoc(

doc(
db,
"books",
id
),

{


title:book.title,

author:book.author,

isbn:book.isbn,

publisher:book.publisher,

publishDate:book.publishDate,

category:book.category,

stock:Number(book.stock),

imageUrl,


updatedAt:
serverTimestamp()


}

);







alert(
"更新しました"
);



router.push(
"/admin/books"
);



}catch(error){


console.error(error);


alert(
"更新失敗"
);


}finally{


setSaving(false);


}


};









if(
loading ||
!isAdmin
){


return(

<main className="p-8">

<p>
権限確認中...
</p>

</main>


);


}









return(


<main className="
mx-auto
max-w-2xl
p-8
">


<h1 className="
mb-8
text-3xl
font-bold
text-gray-900
">

🔒 管理者 本編集

</h1>





<div className="space-y-4">



{Object.entries({

title:"タイトル",

author:"著者",

isbn:"ISBN",

publisher:"出版社",

category:"カテゴリ"

}).map(([key,label])=>(


<input

key={key}

className="
w-full
rounded-lg
border
p-3
text-black
"

placeholder={label}

value={(book as any)[key]}

onChange={(e)=>

setBook({

...book,

[key]:
e.target.value

})

}

/>


))}






<input

type="date"

className="
w-full
rounded-lg
border
p-3
text-black
"

value={book.publishDate}

onChange={(e)=>

setBook({

...book,

publishDate:e.target.value

})

}

/>







<input

type="number"

className="
w-full
rounded-lg
border
p-3
text-black
"

value={book.stock}

onChange={(e)=>

setBook({

...book,

stock:Number(e.target.value)

})

}

/>









{
book.imageUrl &&

<div className="
flex
justify-center
">


<Image

src={book.imageUrl}

alt={book.title}

width={180}

height={250}

/>


</div>


}








<ImageUploader

onSelectFile={(file)=>

setImageFile(file)

}

/>







<button

onClick={updateBook}

disabled={saving}

className="
w-full
rounded-lg
bg-blue-600
p-3
font-bold
text-white
disabled:bg-gray-400
"

>

{
saving
?
"更新中..."
:
"更新する"
}


</button>





</div>



</main>


);


}