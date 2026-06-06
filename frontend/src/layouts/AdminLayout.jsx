import React from 'react'

import Header from '../components/admin/Header'
import Sidebar from '../components/admin/Sidebar'
import { Outlet } from 'react-router-dom'
import useUIStore from '../stores/useUIStore'

const AdminLayout = () => {
  const { isMenuOpen, setIsMenuOpen } = useUIStore()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        isMobileMenuOpen={isMenuOpen}
        setIsMobileMenuOpen={setIsMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          isMobileMenuOpen={isMenuOpen}
          setIsMobileMenuOpen={setIsMenuOpen}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
