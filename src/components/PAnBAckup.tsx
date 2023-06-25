import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limit } from './Config';
import axios from 'axios';

// let handleChartPan: any;
const PanChart = () => {

    const chartRef = useRef<HighchartsReact.Props>(null);

    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);
    const [setxAxes, setSetxAxes] = useState({ xAxisMin: 0, xAxisMax: 0 });

    // const fetchData = async () => {
    //     const newStart = start + limit;
    //     const response = await API.getFuncNodes(newStart);
    //     const newData = response.data.slice(start, newStart);
    //     setStart(newStart);
    //     setData((prevData: any) => [...newData]);
    // };

    const handleChartPan = (e: { target: { xAxis: any; }; }) => {
        const chart = chartRef.current?.chart;
        const xAxis = e.target.xAxis;
        console.log('X axis', xAxis);
        // console.log('X axis', xAxis[0].min);
        // console.log('X axis', xAxis[0].max);
        if (
            xAxis[0].min !== chart.options.xAxis[0].min ||
            xAxis[0].max !== chart.options.xAxis[0].max
        ) {
            setSetxAxes({ xAxisMin: xAxis[0]?.dataMin, xAxisMax: xAxis[0]?.dataMax });
            // console.log('checkpoint', xAxis[0]?.min, xAxis[0]?.max);
            // fromToFetch(xAxis[0]?.min, xAxis[0]?.max);
            // fetchData(xAxis?.min, xAxis?.max);
        }
        // fetchData();
    };

    useEffect(() => {
        // fetchData();
        console.log('objects loaded', setxAxes);
        fromToFetch(setxAxes.xAxisMin, setxAxes.xAxisMax);
    }, [setxAxes]);

    // Function to fetch data from the API
    const fromToFetch = async (min: any, max: any) => {
        const urrr = `http://localhost:3000/data?from=${Math.ceil(Math.abs(min))}&to=${Math.ceil(max)}`;
        const response = await axios.get(urrr);
        console.log('response', response?.data?.data);
        setData((prevData: any) => [...prevData, ...response?.data?.data]);
        // return response.data;

    };


    useEffect(() => {
        // fetchData();
        // fromToFetch(0, limit);
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            chart.update({ series: [{ data }] });
        }
    }, [data]);

    // const handlePan = () => {
    //     fetchData();
    // };



    // useEffect(() => {
    //     const chart = chartRef.current?.chart;

    //     if (chart) {
    //         const redrawHandler = function (this: any) {
    //             const xAxis = this.xAxis[0];
    //             if (
    //                 xAxis.min !== chart.options.xAxis[0].min ||
    //                 xAxis.max !== chart.options.xAxis[0].max
    //             ) {
    //                 console.log('xAxis?.min', xAxis?.min);
    //                 console.log('xAxis?.max', xAxis?.max);
    //                 // fetchData(xAxis?.min, xAxis?.max);
    //             }
    //         };

    //         chart.addChartEventListener('redraw', redrawHandler);

    //         return () => {
    //             chart.removeChartEventListener('redraw', redrawHandler);
    //         };
    //     }
    // }, []);
    // const handleRedraw = () => {
    //     const chart = chartRef.current?.chart;
    //     console.log('charter');
    //     if (chart && chart.isInsidePlot(chart.pointer.chartX - chart.plotLeft, chart.pointer.chartY - chart.plotTop)) {
    //         // console.log('object');
    //         fetchData();
    //     }
    //     // chart?.on('pan', fetchData);
    //     chart?.current?.on('pan', () => {
    //         console.log('print', chart);

    //         // Do something when the chart is clicked
    //     });
    // };

    // const handleRedraw = () => {
    //     // console.log('object');
    //     const chart = chartRef.current?.chart;
    //     chart?.current?.on('pan', (event: { chartX: any; chartY: any; }) => {
    //         const { chartX, chartY } = event;
    //         const isInsidePlot = chart.isInsidePlot(chartX - chart.plotLeft, chartY - chart.plotTop);
    //         if (isInsidePlot) {
    //             fetchData();
    //         }
    //     });
    // };

    // useEffect(() => {
    //     const chart = chartRef.current?.chart;
    //     // console.log('chart', chart);
    //     if (chart) {
    //         // console.log('update');

    //         chart.update({
    //             chart: {
    //                 events: {
    //                     redraw: handleRedraw,
    //                 },
    //             },
    //         });
    //     }
    // }, []);





    return (
        // <div style={{ width: 1000 }}>
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={{
                    chart: {
                        type: "line",
                        // animation: Highcharts.svg, // don't animate in old IE
                        marginRight: 10,
                        zoomType: "x",
                        panKey: 'shift',
                        panning: true,
                        events: {
                            pan: handleChartPan,
                        },
                    },
                    title: {
                        text: "Real-time Time-series Graph",
                    },
                    xAxis: {
                        // type: "datetime",
                        tickPixelInterval: 10,
                    },
                    yAxis: {
                        type: 'logarithmic',
                        title: {
                            text: "Value",
                        },
                        plotLines: [
                            {
                                value: 0,
                                width: 1,
                                color: "#808080",
                            },
                        ],
                    },
                    tooltip: {
                        formatter(this: any): string {
                            // console.log('this.tooltip', this);
                            return `<b>${(this.x)}</b><br/><b>${this.y}</b>`;
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
                            name: "Random data",
                            data: [],
                        },
                    ],
                    accessibility: {
                        enabled: false
                    }
                }}
            />
            {/* <button onClick={handlePan}>Load More</button> */}
        </div>
    );
};

export default memo(PanChart);