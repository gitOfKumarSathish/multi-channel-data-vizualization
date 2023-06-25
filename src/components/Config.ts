const limit = 5000;
const limitForAnnotation = 1000;

const dataMappingForBasicChart = (data: any, chart: any) => {
    const multiChannelData: { name: string; data: any; }[] = [];
    let xAxisTsArray;
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

        xAxisTsArray = chartData?.map((channelData: { xAxisTs: any; data: any[]; }) => channelData?.xAxisTs);
    });
    chart.update({
        series: multiChannelData,
        xAxis: [{ categories: xAxisTsArray }],
    });
};


const dataMappingForAnnotation = (data: any, chart: any) => {
    const multiChannelData: { data: any; }[] = [];
    let uniqueArray: string | unknown[];
    let Yaxis: Iterable<any> | null | undefined = [];
    data.map((singleChannelData: {
        bt: any;
        tt: any;
        tag(tag: any): unknown; data: any;
    }) => {
        Yaxis.push(singleChannelData.tag);
        // const chartCategory = dataFromAPI?.map((plot: { tag: any; }) => plot.tag);
        uniqueArray = [...new Set(Yaxis)];
        const chartData = {
            x: singleChannelData.bt,
            x2: singleChannelData.tt,
            y: uniqueArray.indexOf(singleChannelData.tag),
            title: singleChannelData.tag,
        };

        multiChannelData.push(chartData);

    });
    // console.log('multiChannelData', multiChannelData);
    chart.update({ series: [{ data: multiChannelData }] });


};



export {
    limit,
    dataMappingForBasicChart,
    dataMappingForAnnotation,
    limitForAnnotation
};