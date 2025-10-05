'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'  // <-- yahan se current route milega

const Page = () => {
  const pathname = usePathname()

  return (
    <div className='bg-purple-500 w-full max-h-20 p-9 flex justify-between items-center'>
      <div>
        <p>created by tabi 07</p>
      </div>

      <ul className='flex justify-between gap-14 text-white'>
        <li>
          <Link
            href="/"
            className={`hover:text-red-500 hover:font-bold ${
              pathname === '/' ? 'text-red-500 font-bold underline-offset-8' : ''
            }`}
          >
            TO <span className='text-bold text-cyan-300'>DO</span>
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className={`hover:text-red-500 hover:font-bold ${
              pathname === '/about' ? 'text-red-500 font-bold' : ''
            }`}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            href="/contact"
            className={`hover:text-red-500 hover:font-bold ${
              pathname === '/contact' ? 'text-red-500 font-bold' : ''
            }`}
          >
            Contact
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Page
