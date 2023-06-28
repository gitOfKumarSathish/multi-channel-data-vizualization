const limit = 1000;
const limitForAnnotation = 1000;
const limitForWf = 5000;
const limitForMixed = 1000;

// const dataMappingForBasicChart = (data: any, chart: any) => {
//     console.log('dataMappingForBasicChart', data);

//     if (data.length > 0) {
//         data.forEach((singleChannelData: { data: any; }) => {
//             let xAxisTsArray: any[] = [];
//             let yAxisValueArray: any[] = [];
//             console.log('singleChannelData', singleChannelData);
//             singleChannelData?.data.map((x: { ts: any; value: any; }) => {
//                 xAxisTsArray.push((x?.ts)?.toFixed(2));
//                 yAxisValueArray.push(x?.value);
//             });

//             console.log('xAxisTsArray', xAxisTsArray);
//             chart.update({
//                 series: { data: yAxisValueArray },
//                 xAxis: [{ categories: xAxisTsArray }],
//             });
//         });

//     }

// };

const dataMappingForBasicChart = (data: any) => {
    console.log('dataMappingForBasicChart', data);

    if (data.length > 0) {
        data.forEach((singleChannelData: { data: any; }) => {
            let xAxisTsArray: any[] = [];
            let yAxisValueArray: any[] = [];
            console.log('singleChannelData', singleChannelData);
            singleChannelData?.data.map((x: { ts: any; value: any; }) => {
                xAxisTsArray.push((x?.ts)?.toFixed(2));
                yAxisValueArray.push(x?.value);
            });

            console.log('xAxisTsArray', xAxisTsArray);
        });

    }

};

// const dataMappingForBasicChart = (data: any, chart: any) => {
//     console.log('dataMappingForBasicChart', data);
//     let xAxisTsArray: any[] = [];
//     let yAxisValueArray: any[] = [];
//     if (data.length > 0) {
//         data.forEach((singleChannelData: { ts: any; value: any; }) => {
//             xAxisTsArray.push((singleChannelData?.ts)?.toFixed(2));
//             yAxisValueArray.push(singleChannelData?.value);
//         });
//         console.log('xAxisTsArray', xAxisTsArray);

//     }
//     chart.update({
//         series: { data: yAxisValueArray },
//         xAxis: [{ categories: xAxisTsArray }],
//     });
// };


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
            // y: uniqueArray.indexOf(singleChannelData.tag),
            title: singleChannelData.tag,
        };

        multiChannelData.push(chartData);

    });
    // console.log('multiChannelData', multiChannelData);
    chart.update({ series: [{ data: multiChannelData }] });


};



export {
    limit,
    limitForWf,
    limitForMixed,
    dataMappingForBasicChart,
    dataMappingForAnnotation,
    limitForAnnotation
};