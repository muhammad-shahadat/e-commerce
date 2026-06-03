import 'dotenv/config'

import app from './src/app.js'
import pool from './config/db.js'
import { initKeepAlive } from './src/helper/keepAlive.js'

const port = process.env.PORT || 4000

;(async () => {
  try {
    await pool.query('SELECT NOW()')
    console.log('Neon Database connected successfully')

    app.listen(port, () => {
      console.log(`server is running at http://localhost:${port}`)

      // 💡 ২. সার্ভার সফলভাবে রান হওয়ার পর যদি প্রোডাকশন হয়, তবেই ক্রন জব চালু হবে
      if (process.env.NODE_ENV === 'production') {
        initKeepAlive()
        console.log('🚀 Production Keep-Alive Mechanism has been activated.')
      }
    })
  } catch (error) {
    console.error('Failed to connect to database:', error.message)
    process.exit(1)
  }
})()
