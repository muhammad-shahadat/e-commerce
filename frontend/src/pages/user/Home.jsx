import React from 'react'

import Hero from '../../Components/user/Hero'
import Popular from '../../Components/user/Popular'
import Offer from '../../Components/user/Offer'
import NewCollection from '../../Components/user/NewCollection'
import NewsLetter from '../../Components/user/NewsLetter'

const Home = () => {
  return (
    <>
      <div>
        <Hero />
        <Popular />
        <Offer />
        <NewCollection />
        <NewsLetter />
      </div>
    </>
  )
}
export default Home
