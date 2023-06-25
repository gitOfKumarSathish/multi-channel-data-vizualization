const limit = 5000;

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
        console.log('xAxisTsArray', xAxisTsArray);
    });

    chart.update({
        series: multiChannelData,
        xAxis: [{ categories: xAxisTsArray }],
    });

    console.log('chart updated', chart);
};


const dataMappingForAnnotation = (data: any, chart: any) => {
    console.log('data', data);
    // const dataFromAPI = data[0]?.data;
    const multiChannelData: { name: string; data: any; }[] = [];
    let uniqueArray: string | unknown[];

    // data.push({
    //     channel: 'leannot',
    //     data: [{ tag: 'normal', bt: 10.05457323101686793, tt: 11.376169333269855 },
    //     { tag: 'normal', bt: 12.5145977131359087, tt: 12.4276800061833184 },
    //     { tag: 'normal', bt: 31.4057923595428816, tt: 15.069662850463297 },

    //     { tag: 'abnormal', bt: 12.2744177379412935, tt: 12.5513640419571972 },

    //     { tag: 'abnormal', bt: 12.688017159514625, tt: 12.9630646171113795 },

    //     { tag: 'abnormal', bt: 13.949485328732452, tt: 14.686925802766769 }
    //     ]
    // });
    // console.log('datadatadata', data);
    data.map((singleChannelData: { data: any; }) => {
        const dataFromAPI = singleChannelData?.data;
        const chartCategory = dataFromAPI?.map((plot: { tag: any; }) => plot.tag);
        uniqueArray = [...new Set(chartCategory)];

        const chartData = dataFromAPI?.map((plot: { bt: any; tt: any; tag: string; }) => ({
            x: plot.bt,
            x2: plot.tt,
            y: uniqueArray.indexOf(plot.tag),
            title: plot.tag,
        }));

        multiChannelData.push({
            name: 'chartCategory',
            data: chartData
        });

    });

    chart.update({
        series: multiChannelData,
        // yAxis: [{ categories: uniqueArray }],
    });


};



export {
    limit,
    dataMappingForBasicChart,
    dataMappingForAnnotation
};