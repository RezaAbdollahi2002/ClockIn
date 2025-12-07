import React from 'react'
import { Register } from '../..'
import { FaGithub } from "react-icons/fa";
import Footer from "./Footer"


const HomePage = () => {
  return (
    <div className='w flex-col'>
      <div className='w-full h-auto max-h-[60%]'>
        <Register />
      </div>
      <div className='w-full'>
      <Footer />
      </div>
    </div>
  )
}


export default HomePage
