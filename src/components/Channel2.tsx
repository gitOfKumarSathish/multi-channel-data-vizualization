import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { memo, useEffect, useRef, useState } from "react";
import * as API from './API/API';

// Initialize HighchartsMore module
HighchartsMore(Highcharts);

const options = {
    chart: {
        type: "line",
        // type: "bar",
        zoomType: "xy",
        panKey: 'shift',
        panning: true,
    },
    title: {
        text: "Bar Chart with Pan and Zoom",
    },
    xAxis: {
        categories: [],
    },
    yAxis: {
        type: "logarithmic",
        title: {
            text: "Fruit eaten",
        },
        reversed: false
    },
    tooltip: {
        shared: true,
        crosshair: true,
    },
    series: [
        {
            data: []
        },
    ],
};

const Channel2 = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const handleAfterSetExtremes = (e: any) => {
        const chart = chartRef.current?.chart;
        if (e.trigger !== "syncExtremes") {
            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
                trigger: "syncExtremes",
            });
        }
    };

    options.chart.events = {
        redraw: () => {
            const chart = chartRef.current?.chart;
            chart.xAxis[0].eventArgs = {
                ...chart.xAxis[0].eventArgs,
                preventDefault: () => { },
            };
        },
    };

    options.xAxis.events = {
        afterSetExtremes: handleAfterSetExtremes,
    };

    const fetchData = async () => {
        const response = await API.getVolumes();
        setData(response.data);
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
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
        }
    }, [data]);



    useEffect(() => {
        fetchData();
    }, []);

    return (
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    );
};

export default memo(Channel2);