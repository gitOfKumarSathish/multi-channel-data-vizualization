const limit: number = 5000;
const dataIntegration = (data: any, chart: any) => {
    const dataFromAPI = data[0]?.data;
    const chartData = dataFromAPI?.map((plot: { value: any; ts: any; }) => ({
        plotValue: plot?.value,
        xAxisTs: plot?.ts
    }));
    const plotValueArray = chartData?.map((item: { plotValue: any; }) => item?.plotValue);
    const xAxisTsArray = chartData?.map((item: { xAxisTs: any; }) => item.xAxisTs);
    chart.update({
        series: [{ data: plotValueArray }],
        xAxis: [{ categories: xAxisTsArray }],
    });
};

export {
    limit,
    dataIntegration
};