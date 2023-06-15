import axios from 'axios';

const ApiUrl = {
    getFuncNodes: "https://mocki.io/v1/58e86430-5d39-4c67-bce1-7676da89bdba",
};


const GetMethod = async (url: any) => {
    const response = await axios.get(url);
    return response.data;
};

async function PostMethod(url: string, data: any) {
    const response = await axios.post(url, data);
    return response.data;
}

export function getFuncNodes() {
    let url = ApiUrl.getFuncNodes;
    return GetMethod(url);
}

