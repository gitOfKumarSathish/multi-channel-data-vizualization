const epochConverted = (time: number) => {
    const epochTime = time;
    const date = new Date(epochTime);
    const localISOTimeString = date.toLocaleString();
    return (localISOTimeString.split(',')[1]).trim();
};

export {
    epochConverted
};