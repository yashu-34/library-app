"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged
} from "firebase/auth";

import { auth, db } from "@/firebase/config";

import { useRouter } from "next/navigation";

import {
  PiUsersFill,
  PiShieldCheckFill,
  PiUserFill,
} from "react-icons/pi";


interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
}


export default function UsersPage() {

  const router = useRouter();


  const [users,setUsers] = useState<User[]>([]);
  const [checking,setChecking] = useState(true);



  // =====================
  // 管理者チェック
  // =====================

  useEffect(()=>{

    const unsubscribe =
      onAuthStateChanged(auth,async(user)=>{

        if(!user){
          router.push("/login");
          return;
        }


        const snap =
          await getDoc(
            doc(db,"users",user.uid)
          );


        if(
          !snap.exists() ||
          snap.data().role !== "admin"
        ){

          router.push("/product_search");
          return;

        }


        setChecking(false);

      });


    return ()=>unsubscribe();

  },[router]);





  // =====================
  // ユーザー取得
  // =====================

  useEffect(()=>{

    if(checking) return;


    const fetchUsers = async()=>{

      const snapshot =
        await getDocs(
          collection(db,"users")
        );


      const list =
        snapshot.docs.map((doc)=>({

          id:doc.id,

          ...(doc.data() as Omit<User,"id">)

        }));


      setUsers(list);

    };


    fetchUsers();


  },[checking]);





  const changeRole =
    async(
      uid:string,
      role:string
    )=>{


      await updateDoc(
        doc(db,"users",uid),
        {
          role
        }
      );


      setUsers(prev=>
        prev.map(user=>
          user.id===uid
          ? {...user,role}
          : user
        )
      );

    };


    const deleteUser = async (
      user: User
    ) => {

      // 管理者の場合チェック
      if(user.role === "admin"){

        const adminCount =
          users.filter(
            u => u.role === "admin"
          ).length;


        if(adminCount <= 1){

          alert(
            "最後の管理者は削除できません。"
          );

          return;

        }


        const confirmDelete =
          window.confirm(
            "この管理者を削除しますか？\n\n管理権限がなくなります。"
          );


        if(!confirmDelete){
          return;
        }

      }else{


        const confirmDelete =
          window.confirm(
            `${user.name}さんを削除しますか？`
          );


        if(!confirmDelete){
          return;
        }

      }



  await deleteDoc(
    doc(db,"users",user.id)
  );


  setUsers(prev =>
    prev.filter(
      u => u.id !== user.id
    )
  );


};


  if(checking){

    return(

      <main
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-gray-100
        "
      >

        <p className="text-gray-500">
          確認中...
        </p>

      </main>

    );

  }





  const admins =
    users.filter(
      user=>user.role==="admin"
    );


  const normalUsers =
    users.filter(
      user=>user.role==="user"
    );





  return (

    <main
      className="
        min-h-screen
        bg-gray-100
        px-4
        py-6
        sm:ml-20
        sm:px-6
        lg:ml-64
        lg:px-10
      "
    >

      <div className="mx-auto max-w-6xl">


        {/* タイトル */}

        <div className="mt-8 mb-8 flex items-center gap-3">

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-white
              shadow-sm
            "
          >

            <PiUsersFill
              className="
                h-6
                w-6
                text-gray-700
              "
            />

          </div>


          <div>

            <h1
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              利用者管理
            </h1>

            <p className="text-sm text-gray-500">
              管理者権限で利用者を管理できます
            </p>

          </div>


        </div>





        {/* 管理者 */}

        <UserSection
          title="管理者"
          icon={<PiShieldCheckFill/>}
          users={admins}
          changeRole={changeRole}
          deleteUser={deleteUser}
        />




        {/* 一般ユーザー */}

        <UserSection
          title="一般ユーザー"
          icon={<PiUserFill/>}
          users={normalUsers}
          changeRole={changeRole}
          deleteUser={deleteUser}
        />



      </div>


    </main>

  );

}





// =====================
// 表示コンポーネント
// =====================


function UserSection({

  title,
  icon,
  users,
  changeRole,
  deleteUser,

}:{
  title:string;
  icon:React.ReactNode;
  users:User[];
  changeRole:(id:string,role:string)=>void;
  deleteUser:(user:User)=>void;

}){


return(

<section className="mb-8">


<div className="mb-4 flex items-center gap-2">

  <div className="text-gray-800">
    {icon}
  </div>

  <h2 className="text-lg font-bold text-black">
    {title}
  </h2>

  <span
    className="
      rounded-full
      bg-gray-200
      px-3
      py-1
      text-xs
      font-semibold
      text-black
    "
  >
    {users.length}人
  </span>

</div>



<div
className="
overflow-hidden
rounded-2xl
border
border-gray-200
bg-white
shadow-sm
"
>


<table className="w-full">


<thead>

<tr
className="
border-b
bg-gray-50
text-sm
font-bold
text-black
"
>

<th className="px-5 py-4 text-left">
名前
</th>

<th className="px-5 py-4 text-left">
メールアドレス
</th>

<th className="px-5 py-4 text-left">
住所
</th>

<th className="px-5 py-4 text-left">
権限
</th>

<th className="px-5 py-4 text-left">
削除
</th>


</tr>

</thead>



<tbody>


{
users.map(user=>(

<tr
key={user.id}
className="
border-b
last:border-none
hover:bg-gray-50
"
>


<td
className="
px-5
py-4
font-semibold
text-black
"
>
{user.name}
</td>



<td
className="
px-5
py-4
text-black
"
>
{user.email}
</td>



<td
className="
px-5
py-4
text-black
"
>
{user.address || "未登録"}
</td>




<td
className="
px-5
py-4
"
>


<select

value={user.role}

onChange={(e)=>
changeRole(
user.id,
e.target.value
)
}

className="
rounded-lg
border
border-gray-300
bg-white
px-3
py-2
font-semibold
text-black
outline-none
"

>

<option value="user">
user
</option>

<option value="admin">
admin
</option>


</select>

</td>


<td className="px-5 py-4">

<button
onClick={()=>
deleteUser(user)
}
className="
rounded-lg
bg-red-500
px-4
py-2
text-sm
font-bold
text-white
transition
hover:bg-red-600
"
>
削除
</button>

</td>

</tr>


))

}


</tbody>


</table>


</div>


</section>


);

}