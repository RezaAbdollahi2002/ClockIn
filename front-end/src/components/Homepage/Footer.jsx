import React from 'react'
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-900 text-gray-300 py-12 px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          
          {/* About Section */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-white font-bold text-lg'>About</h3>
            <p className='text-sm leading-relaxed'>
              Building innovative solutions for developers. Empowering teams to create, collaborate, and scale.
            </p>
          </div>

          {/* Product Links */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-white font-bold text-lg'>Product</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li><a href='#features' className='hover:text-purple-400 transition'>Features</a></li>
              <li><a href='#pricing' className='hover:text-purple-400 transition'>Pricing</a></li>
              <li><a href='#docs' className='hover:text-purple-400 transition'>Documentation</a></li>
              <li><a href='#changelog' className='hover:text-purple-400 transition'>Changelog</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-white font-bold text-lg'>Resources</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li><a href='#blog' className='hover:text-purple-400 transition'>Blog</a></li>
              <li><a href='#community' className='hover:text-purple-400 transition'>Community</a></li>
              <li><a href='#support' className='hover:text-purple-400 transition'>Support</a></li>
              <li><a href='#status' className='hover:text-purple-400 transition'>Status</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className='flex flex-col gap-4'>
            <h3 className='text-white font-bold text-lg'>Legal</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li><a href='#privacy' className='hover:text-purple-400 transition'>Privacy Policy</a></li>
              <li><a href='#terms' className='hover:text-purple-400 transition'>Terms of Service</a></li>
              <li><a href='#cookies' className='hover:text-purple-400 transition'>Cookie Policy</a></li>
              <li><a href='#contact' className='hover:text-purple-400 transition'>Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className='border-gray-700 my-8' />

        {/* Bottom Section */}
        <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
          
          {/* Developers & Copyright */}
          <div className='flex flex-col gap-4'>
            <div className='text-sm'>
              <p className='text-white font-semibold mb-2'>Built by</p>
              <div className='flex flex-wrap gap-4 text-xs'>
                <div className='flex items-center gap-2'>
                  <span>Reza Abdollahi</span>
                  <a
                    href="https://github.com/RezaAbdollahi2002"
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-purple-400 hover:text-purple-300 transition'
                  >
                    <FaGithub size={16} />
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <span>Ali Iranmanesh</span>
                  <a
                    href="https://github.com/Aliiiranmanesh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className='text-purple-400 hover:text-purple-300 transition'
                  >
                    <FaGithub size={16} />
                  </a>
                </div>
                <div className='flex items-center gap-2'>
                  <span>Ben Pratkanis</span>
                </div>
              </div>
            </div>
            <p className='text-xs text-gray-500'>
              © {currentYear} DevAI. All rights reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className='flex gap-4'>
            <a
              href='https://github.com'
              target="_blank"
              rel="noopener noreferrer"
              className='text-gray-400 hover:text-purple-400 transition'
              aria-label='GitHub'
            >
              <FaGithub size={24} />
            </a>
            <a
              href='https://twitter.com'
              target="_blank"
              rel="noopener noreferrer"
              className='text-gray-400 hover:text-purple-400 transition'
              aria-label='Twitter'
            >
              <FaTwitter size={24} />
            </a>
            <a
              href='https://linkedin.com'
              target="_blank"
              rel="noopener noreferrer"
              className='text-gray-400 hover:text-purple-400 transition'
              aria-label='LinkedIn'
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href='mailto:contact@yourcompany.com'
              className='text-gray-400 hover:text-purple-400 transition'
              aria-label='Email'
            >
              <FaEnvelope size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer