import apiService from "../../services";
import { ClientUser } from "../types/client.types";


export const getClients = async () => {
    const response = await apiService.get<ClientUser[]>('/user/clients');
    return response;
};