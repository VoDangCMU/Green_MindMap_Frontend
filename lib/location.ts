import { AxiosRequestConfig } from "axios"
import { apiClient, getAccessToken } from "./auth";

export const getAllLocations = async (filters?: any) => {
    try {
        const token = getAccessToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const config: AxiosRequestConfig = {
            method: "GET",
            url: "/locations/get-locations",
            headers,
            params: filters || {},
        };

        const res = await apiClient(config);
        console.log("Locations fetched:", res.data);

        return res.data;
    } catch (error) {
        console.error("Error in getAllLocations:", error);
        throw error;
    }
};

