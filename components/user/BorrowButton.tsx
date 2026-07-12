"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/config";

type Props = {
  id: string;
  isBorrowed: boolean;
};

export default function BorrowButton({
  id,
  isBorrowed,
}: Props) {

  const borrow = async ()=>{

      await updateDoc(
        doc(db,"books",id),
        {
          isBorrowed:!isBorrowed
        }
      );

      location.reload();

  }

  return(

<button
onClick={borrow}
className="rounded bg-green-600 text-white px-4 py-2"
>

{isBorrowed?"返却":"貸出"}

</button>

  )

}