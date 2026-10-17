import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../NavBar/NavBar'

export default function Layout() {
  return (
    <div>
      <Navbar/>
      {/* The matched route (Home, Menu, and the rest) renders here. */}
      <Outlet/>
    </div>
  )
}
