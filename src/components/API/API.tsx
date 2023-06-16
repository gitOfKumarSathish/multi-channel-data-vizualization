import axios from 'axios';
import { limit } from '../Config';

const ApiUrl = {
    // getFuncNodes: "https://mocki.io/v1/58e86430-5d39-4c67-bce1-7676da89bdba",
    getFuncNodes: "http://localhost:3000/data",
    getAnnotations: "http://localhost:3000/annotation"
};


const GetMethod = async (url: any) => {
    const response = await axios.get(url);
    return response.data;
};

async function PostMethod(url: string, data: any) {
    const response = await axios.post(url, data);
    return response.data;
}

export function getFuncNodes(limits: number = limit) {
    let url = ApiUrl.getFuncNodes + `?limit=${limits}`;
    return GetMethod(url);
}

export function getAnnotations() {
    let url = ApiUrl.getAnnotations;
    return GetMethod(url);
}