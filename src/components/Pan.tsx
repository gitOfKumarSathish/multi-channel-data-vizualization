import React, { memo, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { limit } from './Config';

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
        console.log('X axis', xAxis);
        if (
            xAxis[0].min !== chart.options.xAxis[0].min ||
            xAxis[0].max !== chart.options.xAxis[0].max
        ) {
            // setXAxesValues({ xAxisMin: xAxis[0]?.dataMin, xAxisMax: xAxis[0]?.dataMax });
            setXAxesValues({ xAxisMin: 0, xAxisMax: xAxesValues.xAxisMax + 1000 });
        }
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
            // setData((prevData: any) => [...prevData, ...newData]);
            setData(newData);
            setVisibleData(newData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        console.log('data', data);
        console.log('visibleData', visibleData);
        // const oo = data.splice(0, visibleData.length);
        // console.log('00', oo);
        if (chart) {
            chart.update({ series: [{ data: data.splice(0, data.length - 0) }] });
        }
    }, [visibleData]);

    return (
        <div style={{ width: 1000 }}>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={{
                    chart: {
                        type: 'line',
                        marginRight: 10,
                        zoomType: 'x',
                        panKey: 'shift',
                        panning: true,
                        events: {
                            pan: handleChartPan,
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
                }}
            />
        </div>
    );
};

export default memo(PanChart);
