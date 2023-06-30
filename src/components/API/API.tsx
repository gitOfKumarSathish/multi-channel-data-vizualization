import axios from 'axios';

const ApiUrl = {
    getAnnotations: "http://localhost:3000/annotation",
    getVolumes: "http://localhost:3000/volume",
    viewConfig: "http://localhost:3000/viewConfig",
    baseURl: "http://localhost:3000",
    waveForm: "http://localhost:3000/wf",
    mixed: "http://localhost:3000/mixed",

};


const GetMethod = async (url: any) => {
    const response = await axios.get(url);
    return response.data;
};

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


export function getData(channel: string, min: number, max: number) {
    const url = `${ApiUrl.baseURl + '/' + channel}?from=${min}&to=${max}`;
    return GetMethod(url);
}


export function annot(min: number, max: number) {
    const url = `${ApiUrl.getAnnotations}?from=${min}&to=${max}`;
    return GetMethod(url);
}

export function volume(min: number, max: number) {
    const url = `${ApiUrl.getVolumes}?from=${min}&to=${max}`;
    return GetMethod(url);
}

export function waveForm(min: number, max: number) {
    const url = `${ApiUrl.waveForm}?from=${min}&to=${max}`;
    return GetMethod(url);
}

export function mixed(min: number, max: number) {
    const url = `${ApiUrl.mixed}?from=${min}&to=${max}`;
    return GetMethod(url);
}

