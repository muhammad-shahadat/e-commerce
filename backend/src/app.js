import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import createHttpError from 'http-errors'

import { errorResponse } from './controllers/responseController.js'
import productRouter from './routes/productRoute.js'
import categoryRouter from './routes/categoryRoute.js'
import orderRouter from './routes/orderRoute.js'
import dashboardRouter from './routes/dashboardRoute.js'
import inventoryRouter from './routes/inventoryRoute.js'

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//home route
app.get('/', (req, res) => {
  res.status(200).send('Ecommerce Project')
})

//Health route (add this)
app.get('/health', (req, res) => {
  res.status(200).send('OK')
})

//products route
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)

//orders route
app.use('/api/orders', orderRouter)

//dashboard route
app.use('/api/admin/dashboard', dashboardRouter)

//inventory route
app.use('/api/admin/inventory', inventoryRouter)

/** ============Error Handling============ **/
//bad request
app.use((req, res, next) => {
  next(createHttpError(404, 'bad request! path not found'))
})

//internal server error nad all global errors
app.use((error, req, res, next) => {
  errorResponse(res, {
    statusCode: error.status,
    message: error.message,
  })
})

export default app
