import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { memo, useEffect, useRef, useState } from "react";
import * as API from './API/API';
import { dataMappingForBasicChart, limitForAnnotation } from "./Config";
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module
// Initialize HighchartsMore module
HighchartsMore(Highcharts);


let previousMin = 0;
let previousMax = 0;

const Channel2 = (props: any) => {
    const { chart_type, x_label, y_label, chart, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [xAxesValues, setXAxesValues] = useState<{ xAxisMin: number; xAxisMax: number; }>({
        xAxisMin: 0,
        xAxisMax: 0,
    });

    const handleChartPan = (e: { target: { xAxis: any; }; }) => {
        const chart = chartRef.current?.chart;
        // console.log('e.target', e.target);


        const xAxiss = chart.xAxis[0]; // get the first xAxis object (assuming there is only one)

        const min = xAxiss.getExtremes().min; // get the minimum value
        const max = xAxiss.getExtremes().max; // get the maximum value

        // console.log('xAxis extremes:', min, max); // log the values to the console


        const xAxis = e.target.xAxis;
        // console.log('X axis', xAxis);
        // console.log('chart.options', chart.options);

        // console.log('xAxis[0].min => ', xAxis[0].min, 'chartOption =>', previousMin);
        // console.log('xAxis[0].max => ', xAxis[0].max, 'chartOption =>', previousMax);

        // if (xAxis[0].min >= previousMin || xAxis[0].max >= previousMax) {

        //     console.log('Im coming');
        //     previousMin = xAxis[0].min;
        //     previousMax = xAxis[0].max;
        //     setXAxesValues({ xAxisMin: xAxesValues.xAxisMax + 1, xAxisMax: xAxesValues.xAxisMax + limitForAnnotation });
        // }
        // if ((min === 0 || min) && (max === 0 || max)) {
        //     if (xAxis[0].min >= previousMin || xAxis[0].max >= previousMax) {
        //         previousMin = min;
        //         previousMax = max;
        //         // setXAxesValues({ xAxisMin: min, xAxisMax: max });
        //         setXAxesValues({ xAxisMin: xAxesValues.xAxisMax + 1, xAxisMax: xAxesValues.xAxisMax + limitForAnnotation });
        //     }
        // }

    };

    useEffect(() => {
        fromToFetch(xAxesValues.xAxisMin, xAxesValues.xAxisMax);
    }, [xAxesValues]);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.chart.reflow();
        }
    }, []);

    const fromToFetch = async (min: number, max: number) => {
        const response = await API.volumePanning(min, max);

        try {
            // const response = await axios.get(apiData);
            const newData = response?.data;
            // const checking = newData;
            if (newData.length > 0) {
                // console.log('if data is not empty', data);
                // setData((prevData: any) => [...prevData, ...newData]);
                setData(newData);
            }
            // // else {
            // //     console.log('else data is not empty', data);
            // //     setData(data);
            // }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // const setResetData = () => {
    //     setXAxesValues({ xAxisMin: xAxesValues.xAxisMax + 1, xAxisMax: xAxesValues.xAxisMax + limitForAnnotation });
    // };

    const options = {
        chart: {
            // type: "line",
            type: String(chart_type),
            // type: "column",
            // type: 'bar',
            pinchType: 'x',
            zoomType: "xy",
            panKey: 'shift',
            panning: true,
            events: {
                pan: handleChartPan,
                // selection: function (event: { resetSelection: any; }) {
                //     if (event.resetSelection) {
                //         console.log('resetSelection');
                //         setResetData();
                //     }
                // }
                mouseMove: function (event) {
                    var chart = this;
                    var xAxis = chart.xAxis[0];

                    // Check if the mouse is near the end of the chart
                    if (event.chartX > chart.plotWidth - 10 && xAxis.max < 100) {
                        // Make an API call to retrieve new data
                        // Replace the URL with your API endpoint

                        // console.log('xAxis.max + 1', xAxis.max + 1);
                        // console.log('xAxis.max + 10', xAxis.max + 10);
                        // $.getJSON('https://your-api-endpoint.com/data', {
                        //     start: xAxis.max + 1,
                        //     end: xAxis.max + 10
                        // }, function (data) {
                        //     // Add the new data to the chart
                        //     chart.series[0].setData(chart.series[0].data.concat(data));
                        // });
                    }
                }

            }
        },
        title: {
            text: String(chart)
        },
        xAxis: {
            // min: 0,
            // max: data[data.length],
            // max: data.length + 1000,
            min: 0,
            max: 10,
            categories: [],
            tickPixelInterval: 100,
            title: {
                text: String(x_label)
            },
            tickPositioner: function (min, max) {
                const positions = this.tickPositions.slice(); // copy existing tick positions
                const interval = (max - min) / 1; // calculate interval between tick positions
                for (let i = 1; i < 100; i++) {
                    positions.splice(i, 0, min + (i * interval)); // add extra tick positions
                }
                // console.log('positions', positions);
                return positions;
            },
            // events: {
            //     afterSetExtremes: (e) => {
            //         console.log('extremer', e);

            //         // fetch new data based on updated xAxis extremes
            //         // fetchData(e.min, e.max).then(newData => {
            //         //     // update chart series with new data
            //         //     const chart = chartRef.current.chart;
            //         //     chart.series[0].setData(newData);
            //         // });
            //     }
            // },
            events: {
                afterSetExtremes: (e) => {
                    // console.log('extremer', e.trigger);
                    if (e.trigger === 'navigator') {

                        const range = e.max - e.min; // calculate range of chart
                        const left = e.min - (range / 2); // calculate new left extreme
                        const right = e.max + (range / 2); // calculate new right extreme
                        // console.log(';left:', left, 'right:', right);

                        fromToFetch(left, right);
                        // fetch new data based on new extremes
                        // fetchData(left, right).then(newData => {
                        //     // update chart series with new data
                        //     const chart = chartRef.current.chart;
                        //     chart.series[0].setData(newData);
                        // });
                    }
                }
            }
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

        series: [
            { turboThreshold: 100000, data: [] },
            // { turboThreshold: 100000, showInLegend: false, data: [{ x: 1418435999999 }], color: 'rgba(0,0,0,0)', enableMouseTracking: false }
        ],
        navigator: {
            enabled: true // enable the navigator
        },
        scrollbar: {
            enabled: true // enable the scrollbar
        },
        rangeSelector: {
            enabled: false // enable the range selector
        },
    };


    const fetchData = async () => {
        const promises = src_channels.map((eachChannel: { channel: string; }) =>
            API.getData(eachChannel.channel)
        );

        try {
            const responses = await Promise.all(promises);
            const newData = responses.reduce((acc: any[], response: any) => {
                acc.push(...response.data);
                return acc;
            }, []);

            setData((prev: any) => [...newData, ...prev]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // console.log('data', data);
        const chart = chartRef.current?.chart;
        if (chart && data.length > 0) {
            dataMappingForBasicChart(data, chart);
        }
    }, [data]);


    options.chart.events = {
        redraw: () => {
            const chart = chartRef.current?.chart;
            const xAxis = chart.xAxis[0];

            // Check if the extremes have changed
            if (xAxis.prevMin !== xAxis.min || xAxis.prevMax !== xAxis.max) {
                // Store the new extremes
                xAxis.prevMin = xAxis.min;
                xAxis.prevMax = xAxis.max;

                // Make an API call to retrieve new data
                // Replace the URL with your API endpoint
                fetch('http://localhost:3000/volume?from=' + xAxis.min + '&to=' + xAxis.max)
                    .then(response => response.json())
                    .then(data => {
                        // Add the new data to the chart
                        // console.log('data:', data);
                        // setChartData(chartData.concat(data));
                    });
            }
        },
    };
    useEffect(() => {

        options.chart.events = {
            redraw: () => {
                const xAxis = chart.xAxis[0];

                // Check if the extremes have changed
                if (xAxis.prevMin !== xAxis.min || xAxis.prevMax !== xAxis.max) {
                    // Store the new extremes
                    xAxis.prevMin = xAxis.min;
                    xAxis.prevMax = xAxis.max;

                    // Make an API call to retrieve new data
                    // Replace the URL with your API endpoint
                    fetch('http://localhost:3000/volume?from=' + xAxis.min + '&to=' + xAxis.max)
                        .then(response => response.json())
                        .then(data => {
                            // Add the new data to the chart
                            // console.log('data:', data);
                            // setChartData(chartData.concat(data));
                        });
                }
            },
        };
        // Store the chart instance in a variable
        // const chart = chartRef.current?.chart;

        // // Listen to the redraw event
        // chart.events.redraw = function () {
        //     const xAxis = chart.xAxis[0];

        //     // Check if the extremes have changed
        //     if (xAxis.prevMin !== xAxis.min || xAxis.prevMax !== xAxis.max) {
        //         // Store the new extremes
        //         xAxis.prevMin = xAxis.min;
        //         xAxis.prevMax = xAxis.max;

        //         // Make an API call to retrieve new data
        //         // Replace the URL with your API endpoint
        //         fetch('http://localhost:3000/volume?from=' + xAxis.min + '&to=' + xAxis.max)
        //             .then(response => response.json())
        //             .then(data => {
        //                 // Add the new data to the chart
        //                 console.log('data:', data);
        //                 // setChartData(chartData.concat(data));
        //             });
        //     }
        // };
    }, []);


    return (
        <div style={{ width: 1000 }}>
            {/* <div> */}
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef}
                constructorType={'stockChart'} // use stockChart constructor
            />
        </div>

    );
};

export default memo(Channel2);


