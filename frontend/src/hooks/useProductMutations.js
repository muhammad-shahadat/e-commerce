import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast"

import api from "../api/api";
import useProductStore from "../stores/useProductStore";



export const useCreateProducts = () => {
    const queryClient = useQueryClient();
    const {onProductSuccess} = useProductStore();

    return useMutation({
        mutationFn: async (formData) => {
            const res = await api.post("/api/products/", formData);
            return res.data.payload;
        },

        onSuccess: (data, variables, context) => {

            onProductSuccess(data); // Zustand update
            queryClient.invalidateQueries(["products"]);
            const title = variables.get('title'); // variables received formData that is not js object. so used get()
            toast.success(`${title} Created Successfully`);

        },

        onError: (err) => {
            toast.error(err.response?.data?.message || "Error creating product!");
        }


    })
}