const limit = 5000;

const dataMappingForBasicChart = (data: any, chart: any) => {
    const multiChannelData: { name: string; data: any; }[] = [];

    data.forEach((singleChannelData: { channel: string; data: any; }) => {
        const { channel, data: dataFromAPI } = singleChannelData;

        const chartData = dataFromAPI?.map((plot: { value: any; ts: any; }) => ({
            plotValue: plot?.value,
            xAxisTs: plot?.ts
        }));

        const plotValueArray = chartData?.map((item: { plotValue: any; }) => item?.plotValue);
        multiChannelData.push({
            name: channel,
            data: plotValueArray
        });
    });

    const xAxisTsArray = multiChannelData.flatMap(channelData => channelData.data.map((item: any) => item.xAxisTs));

    chart.update({
        series: multiChannelData,
        xAxis: [{ categories: xAxisTsArray }],
    });
};


const dataMappingForAnnotation = (data: any, chart: any) => {
    const dataFromAPI = data[0]?.data;
    const chartCategory = dataFromAPI?.map((plot: { tag: any; }) => plot.tag);
    const uniqueArray = [...new Set(chartCategory)];

    const chartData = dataFromAPI?.map((plot: { bt: any; tt: any; tag: string; }) => ({
        x: plot.bt,
        x2: plot.tt,
        y: uniqueArray.indexOf(plot.tag),
        title: plot.tag,
        // color:plot.data.tag === 'normal' ? 'green' : 'red',
    }));
    chart.update({
        series: [{ data: chartData }],
        yAxis: [{ categories: uniqueArray }],
    });
};



export {
    limit,
    dataMappingForBasicChart,
    dataMappingForAnnotation
};