"use client"

import { useParams } from "next/navigation"

function page() {

    const params = useParams<{id:string}>()
  return (
    <div>page</div>
  )
}

export default page