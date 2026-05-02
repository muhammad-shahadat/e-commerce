import { useQuery } from "@tanstack/react-query";

import api from "../api/api";



const useGetCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await api.get("/api/categories/");
            return res.data.payload;
        },

        retry: false,
        staleTime: Infinity,
    })
}


export default useGetCategories;

