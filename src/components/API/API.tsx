import axios from 'axios';
import { limit } from '../Config';

const ApiUrl = {
    getFuncNodes: "http://localhost:3000/data",
    getAnnotations: "http://localhost:3000/annotation",
    getVolumes: "http://localhost:3000/volume",
    viewConfig: "http://localhost:3000/viewConfig",
    baseURl: "http://localhost:3000"

};


const GetMethod = async (url: any) => {
    // console.log('finally called', url);
    const response = await axios.get(url);
    return response.data;
};

async function PostMethod(url: string, data: any) {
    const response = await axios.post(url, data);
    return response.data;
}

export function getFuncNodes(limits: number = limit) {
    const url = ApiUrl.getFuncNodes + `?limit=${limits}`;
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


export function Annotpanning(min: number, max: number) {
    // const url = ApiUrl;
    const cc = `${ApiUrl.getAnnotations + '?from=' + Math.ceil(Math.abs(min)) + '&to=' + Math.ceil(Math.abs(max))}`;

    console.log('cc', cc);
    // const surl = `http://localhost:3000/data?from=${Math.ceil(Math.abs(min))}&to=${Math.ceil(
    //     max
    // )}`
    return GetMethod(cc);
}


export function panning(min: number, max: number) {
    // const url = ApiUrl;
    const cc = `${ApiUrl.getVolumes + '?from=' + Math.ceil(Math.abs(min)) + '&to=' + Math.ceil(Math.abs(max))}`;

    console.log('cc', cc);
    // const surl = `http://localhost:3000/data?from=${Math.ceil(Math.abs(min))}&to=${Math.ceil(
    //     max
    // )}`
    return GetMethod(cc);
}
