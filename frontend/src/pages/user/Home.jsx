import React from 'react'

import Hero from '../../components/user/Hero'
import Popular from '../../components/user/Popular'
import Offer from '../../components/user/Offer'
import NewCollection from '../../components/user/NewCollection'
import NewsLetter from '../../components/user/NewsLetter'

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
