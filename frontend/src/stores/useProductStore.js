import {create} from 'zustand';


const useProductStore = create((set, get) => ({
    totalProductsCreated: 0,
    lastAddedProduct: null,
    onProductSuccess: (productData) => set((state) => ({
        totalProductsCreated: state.totalProductsCreated + 1,
        lastAddedProduct: state.lastAddedProduct = productData,
    }))
}));


export default useProductStore;