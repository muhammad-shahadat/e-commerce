import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // whenever URL (pathname) will change, it will take the top position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth', // you can also use "instant"
    })
  }, [pathname])

  return null
}

export default ScrollToTop
