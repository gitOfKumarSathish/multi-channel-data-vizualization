import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { memo, useEffect, useRef, useState } from "react";
import * as API from './API/API';
import { dataMappingForBasicChart, limitForAnnotation } from "./Config";

// Initialize HighchartsMore module
HighchartsMore(Highcharts);


let previousMin = 0;
let previousMax = 0;

const Volume = (props: any) => {
    const { chart_type, x_label, y_label, chart, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [xAxesValues, setXAxesValues] = useState<{ xAxisMin: number; xAxisMax: number; }>({
        xAxisMin: 0,
        xAxisMax: limitForAnnotation,
    });

    useEffect(() => {
        fromToFetch(xAxesValues.xAxisMin, xAxesValues.xAxisMax);
    }, [xAxesValues]);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.chart.reflow();
        }
    }, []);

    const fromToFetch = async (min: number, max: number) => {
        const response = await API.volume(min, max);

        try {
            const newData = response?.data;
            setData((prevData: any) => [...prevData, ...newData]);
            // setData(newData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const options = {
        chart: {
            // type: "line",
            type: String(chart_type),
            // type: "column",
            // type: 'bar',
            zoomType: "xy",
            panKey: 'shift',
            panning: true,

        },
        title: {
            text: String(chart)
        },
        xAxis: {
            categories: [],
            tickPixelInterval: 1000,
            title: {
                text: String(x_label)
            },
        },
        yAxis: {
            // type: "logarithmic",
            title: {
                text: String(y_label)
            },
            reversed: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true,
            crosshair: true,
            formatter(this: any): string {
                return `<b>${this.x}</b><br/><b>${this.y}</b>`;
            },
        },
        series: { turboThreshold: 10000, data: [] }
    };



    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataMappingForBasicChart(data, chart);
        }
    }, [data]);



    // useEffect(() => {
    //     fetchData();
    // }, []);
    console.log('chartXYZ', chartRef.current?.chart);
    return (
        <div style={{ width: 1000 }}>
            {/* <div> */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>

    );
};

export default memo(Volume);


