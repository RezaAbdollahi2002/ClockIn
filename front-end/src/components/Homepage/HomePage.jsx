import React from 'react'
import { Register } from '../..'
import { FaGithub } from "react-icons/fa";
import Footer from "./Footer"


const HomePage = () => {
  return (
    <div className=' w-full flex-col ch-screen'>
      <div className='w-full h-screen '>
        <Register />
      </div>
      {/* <div className='w-full -mt-20'>
      <Footer />
      </div> */}
    </div>
  )
}


export default HomePage
