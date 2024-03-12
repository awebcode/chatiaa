import React from 'react'
import dynamic from 'next/dynamic'
const Login=dynamic(()=>import("../components/Login"))

const page = () => {
  return (
    <div><Login/></div>
  )
}

export default page