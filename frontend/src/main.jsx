import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

import './index.css'
import App from './App.jsx'
import ShopContextProvider from "../src/Context/ShopContext.jsx";




const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        }
    }
})


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient} >
            <BrowserRouter>
                <ShopContextProvider>
                    <App />
                </ShopContextProvider>
            </BrowserRouter>
            {import.meta.env.MODE === "development" && <ReactQueryDevtools />}
        </QueryClientProvider>
        
    </StrictMode>,
)
