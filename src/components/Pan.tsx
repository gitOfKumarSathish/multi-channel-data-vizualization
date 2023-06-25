import React, { memo, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { limit } from './Config';
let previousMin = 0;
let previousMax = 0;
const PanChart = () => {
    const chartRef = useRef<any>(null);
    const [data, setData] = useState<any>([]);
    const [visibleData, setVisibleData] = useState([]);
    const [xAxesValues, setXAxesValues] = useState<{ xAxisMin: number; xAxisMax: number; }>({
        xAxisMin: 0,
        xAxisMax: limit,
    });

    const handleChartPan = (e: { target: { xAxis: any; }; }) => {
        const chart = chartRef.current?.chart;
        const xAxis = e.target.xAxis;
        // console.log('X axis', xAxis);
        // console.log('chart.options', chart.options);

        console.log('xAxis[0].min => ', xAxis[0].min, 'chartOption =>', previousMin);
        console.log('xAxis[0].max => ', xAxis[0].max, 'chartOption =>', previousMax);

        if (xAxis[0].min > previousMin || xAxis[0].max > previousMax) {
            previousMin = xAxis[0].min;
            previousMax = xAxis[0].max;
            setXAxesValues({ xAxisMin: xAxesValues.xAxisMax, xAxisMax: xAxesValues.xAxisMax + limit });
        }
    };

    const setResetData = () => {
        console.log('xAxesValues', xAxesValues);
        setXAxesValues({ xAxisMin: xAxesValues.xAxisMax, xAxisMax: xAxesValues.xAxisMax + limit });
    };

    useEffect(() => {
        fromToFetch(xAxesValues.xAxisMin, xAxesValues.xAxisMax);
    }, [xAxesValues]);

    const fromToFetch = async (min: number, max: number) => {
        const apiData = `http://localhost:3000/data?from=${Math.ceil(Math.abs(min))}&to=${Math.ceil(
            max
        )}`;
        try {
            const response = await axios.get(apiData);
            const newData = response?.data?.data;
            setData((prevData: any) => [...prevData, ...newData]);
            // setData(newData);
            setVisibleData(newData);
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
            type: 'line',
            marginRight: 10,
            zoomType: 'x',
            panKey: 'shift',
            panning: true,
            events: {
                pan: handleChartPan,
                selection: function (event: { resetSelection: any; }) {
                    if (event.resetSelection) {
                        console.log('resetSelection');
                        setResetData();
                    }
                }
            },
        },
        title: {
            text: 'Real-time Time-series Graph',
        },
        xAxis: {
            tickPixelInterval: 100,
        },
        yAxis: {
            type: 'logarithmic',
            title: {
                text: 'Value',
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080',
                },
            ],
        },
        tooltip: {
            formatter(this: any): string {
                return `<b>${this.x}</b><br/><b>${this.y}</b>`;
            },
        },
        legend: {
            enabled: false,
        },
        exporting: {
            enabled: true,
        },
        series: [
            {
                name: 'Random data',
                data: data,
            },
        ],
        accessibility: {
            enabled: false,
        },
    };
    return (
        // <div style={{ width: 1000 }}>
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
            />
        </div>
    );
};

export default memo(PanChart);
