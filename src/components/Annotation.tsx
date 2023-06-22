import React, { useRef, useEffect, memo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import * as API from './API/API';
import { dataMappingForAnnotation, limit } from "./Config";

// Initialize HighchartsMore module
xrange(Highcharts);

let previousMin = 0;
let previousMax = 0;

const Annotation = (props: any) => {
    const { chart, chart_type, x_label, y_label } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [xAxesValues, setXAxesValues] = useState<{ xAxisMin: number; xAxisMax: number; }>({
        xAxisMin: 0,
        xAxisMax: limit,
    });

    const handleChartPan = (e: { target: { xAxis: any; }; }) => {
        const chart = chartRef.current?.chart;
        const xAxis = e.target.xAxis;
        console.log('X axis', xAxis);
        // console.log('chart.options', chart.options);

        console.log('xAxis[0].min => ', xAxis[0].min, 'chartOption =>', previousMin);
        console.log('xAxis[0].max => ', xAxis[0].max, 'chartOption =>', previousMax);

        if (xAxis[0].min > previousMin || xAxis[0].max > previousMax) {
            previousMin = xAxis[0].min;
            previousMax = xAxis[0].max;
            setXAxesValues({ xAxisMin: xAxesValues.xAxisMax, xAxisMax: xAxesValues.xAxisMax + limit });
        }
    };

    useEffect(() => {
        fromToFetch(xAxesValues.xAxisMin, xAxesValues.xAxisMax);
    }, [xAxesValues]);

    const fromToFetch = async (min: number, max: number) => {
        const response = await API.panning(min, max);

        try {
            // const response = await axios.get(apiData);
            console.log('response', response);
            const newData = response?.data;
            const checking = newData;
            console.log('checking', checking);
            setData((prevData: any) => [...prevData, ...newData]);
            // setData(newData);
            // setVisibleData(newData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        // console.log('data', data);
        // console.log('visibleData', visibleData);
        // const oo = data.splice(0, visibleData.length);
        // console.log('00', oo);
        console.log('data', data);
        if (chart) {
            // const startIndex = Math.max(0, data.length - 5000);
            // const latestData = data.splice(startIndex);
            // chart.update({ series: [{ data: latestData }] });
            chart.update({ series: [{ data }] });

            // const latest50 = data.slice(data.length - limit);
            // console.log('latest50', latest50);
            // chart.update({ series: [{ data: latest50 }] });
            // chart.update({ series: [{ data: data.slice(-5000) }] });
        }
    }, [data]);

    const options = {
        chart: {
            type: String(chart_type),
            zoomType: 'x',
            panKey: 'shift',
            panning: true,
            events: {
                pan: handleChartPan,
            }
        },
        title: {
            text: String(chart)
        },

        xAxis: {
            // type: 'datetime',
            title: {
                text: String(x_label)
            },
        },
        yAxis: {
            title: {
                text: String(y_label)
            },
            categories: [],
            reversed: false
        },
        tooltip: {
            formatter(this: any): string {
                return `<b>${this.x.toFixed(2) + ' - ' + this.x2.toFixed(2)}</b><br/><b>${this.yCategory}</b>`;
            },
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false, // Disable legends
        },
        series: [{
            name: { chart },
            pointPadding: 1,
            groupPadding: 1,
            borderColor: 'gray',
            pointWidth: 20,
            data: [],
            dataLabels: {
                enabled: true,
                align: 'center',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                },
                formatter(this: any): string {
                    return this.point?.title;
                },
            },
        },
        {
            data: []
        }
        ]

    };

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.chart.reflow();
        }
    }, []);

    const fetchData = async () => {
        const response = await API.getAnnotations();
        setData(response.data);
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataMappingForAnnotation(data, chart);
        }
    }, [data]);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div style={{ width: 1000 }}>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
};

export default memo(Annotation);
