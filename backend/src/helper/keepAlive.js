import axios from 'axios'

import pool from '../../config/db.js'

const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000 // ১৪ মিনিট

export const initKeepAlive = () => {
  setInterval(async () => {
    try {
      // 💡 এখানে লোকালহোস্টের মতো রেন্ডারের ক্ষেত্রেও শেষে /health রুটটাই কল হবে
      const backendUrl =
        process.env.BACKEND_HEALTH_URL || 'http://localhost:3000/health'

      await axios.get(backendUrl)
      console.log('🔄 Self-ping successful: Server is awake.')

      // Neon Database-কে সচল রাখার ডামি কোয়েরি
      await pool.query('SELECT 1')
      console.log('🗄️ Database ping successful: Neon is active.')
    } catch (error) {
      console.error('❌ Keep-alive ping failed:', error.message)
    }
  }, KEEP_ALIVE_INTERVAL)
}
