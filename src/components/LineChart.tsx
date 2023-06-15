import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { useRef } from "react";

// Initialize HighchartsMore module
HighchartsMore(Highcharts);

const options = {
    chart: {
        type: "line",
        // type: "bar",
        zoomType: "xy",
    },
    title: {
        text: "Bar Bar Chart with Pan and Zoom",
    },
    xAxis: {
        categories: ["Apples", "Oranges", "Pears", "Grapes", "Bananas"],
    },
    yAxis: {
        type: "logarithmic",
        title: {
            text: "Fruit eaten",
        },
    },
    tooltip: {
        shared: true,
        crosshair: true,
    },
    series: [
        {
            name: "John",
            data: [5, 3, 4, 7, 2],
        },
        {
            name: "Jane",
            data: [2, 2, 3, 2, 1],
        },
        {
            name: "Joe",
            data: [3, 4, 4, 2, 5],
        },
    ],
};

const LineChart = () => {
    const chartRef = useRef(null);

    const handleAfterSetExtremes = (e: any) => {
        const chart = chartRef.current.chart;
        if (e.trigger !== "syncExtremes") {
            chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
                trigger: "syncExtremes",
            });
        }
    };

    options.chart.events = {
        redraw: () => {
            const chart = chartRef.current.chart;
            chart.xAxis[0].eventArgs = {
                ...chart.xAxis[0].eventArgs,
                preventDefault: () => { },
            };
        },
    };

    options.xAxis.events = {
        afterSetExtremes: handleAfterSetExtremes,
    };

    return (
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    );
};

export default LineChart;