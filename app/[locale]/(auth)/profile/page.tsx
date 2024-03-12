import dynamic from 'next/dynamic'
import React from 'react'
const Profile = dynamic(() => import("../components/Profile"));

const page = () => {
  return (
    <div><Profile/></div>
  )
}

export default page