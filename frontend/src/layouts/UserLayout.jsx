import React from 'react'
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <>
        <Header />
        <main><Outlet /></main>
        <Footer />

    </>
  )
}

export default UserLayout;