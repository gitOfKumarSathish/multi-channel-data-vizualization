import axios from 'axios';
import { limit } from '../Config';

const ApiUrl = {
    getSampleData: "http://localhost:3000/data",
    getAnnotations: "http://localhost:3000/annotation",
    getVolumes: "http://localhost:3000/volume",
    viewConfig: "http://localhost:3000/viewConfig",
    baseURl: "http://localhost:3000"

};


const GetMethod = async (url: any) => {
    const response = await axios.get(url);
    return response.data;
};

async function PostMethod(url: string, data: any) {
    const response = await axios.post(url, data);
    return response.data;
}




export function getSampleData(limits: number = limit) {
    const url = ApiUrl.getSampleData + `?limit=${limits}`;
    return GetMethod(url);
}

export function getAnnotations() {
    const url = ApiUrl.getAnnotations;
    return GetMethod(url);
}

export function getVolumes() {
    const url = ApiUrl.getVolumes;
    return GetMethod(url);
}

export function viewConfig() {
    const url = ApiUrl.viewConfig;
    return GetMethod(url);
}


export function getData(channel: string) {
    const url = `${ApiUrl.baseURl + '/' + channel}`;
    return GetMethod(url);
}

