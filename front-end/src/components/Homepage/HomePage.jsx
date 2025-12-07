import React from 'react'
import { Register } from '../Helpers'
import { FaGithub } from "react-icons/fa";
import Footer from './Footer';
const HomePage = () => {
  return (
    <div className='h-auto w-full flex-col'>
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
