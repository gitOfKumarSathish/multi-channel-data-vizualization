import React, { useRef, useEffect, memo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsBoost from 'highcharts/modules/boost';
import xrange from "highcharts/modules/xrange";
import * as API from './API/API';
import { dataMappingForAnnotation, limitForAnnotation } from "./Config";
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
HighchartsStock(Highcharts); // initialize the Stock module
// Initialize HighchartsMore module
xrange(Highcharts);
HighchartsBoost(Highcharts);

let previousMin = 0;
let previousMax = 0;

const Annotation = (props: any) => {
    const { chart, chart_type, x_label, y_label } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [isLoading, setIsLoading] = useState<boolean>();

    const [data, setData] = useState<any>([]);
    const [xAxesValues, setXAxesValues] = useState<{ xAxisMin: number; xAxisMax: number; }>({
        xAxisMin: 0,
        xAxisMax: limitForAnnotation,
    });

    const handleChartPan = (e: { target: { xAxis: any; }; }) => {
        const chart = chartRef.current?.chart;
        const xAxis = e.target.xAxis;
        console.log('X axis', xAxis);
        console.log('chart.options', chart.options);

        console.log('xAxis[0].min => ', xAxis[0].min, 'chartOption =>', previousMin);
        console.log('xAxis[0].max => ', xAxis[0].max, 'chartOption =>', previousMax);

        if (xAxis[0].min > previousMin || xAxis[0].max > previousMax) {

            console.log('Im coming');
            previousMin = xAxis[0].min;
            previousMax = xAxis[0].max;
            setXAxesValues({ xAxisMin: xAxesValues.xAxisMax, xAxisMax: xAxesValues.xAxisMax + limitForAnnotation });
        } else {
            setXAxesValues({ xAxisMin: xAxesValues.xAxisMax, xAxisMax: xAxesValues.xAxisMax + limitForAnnotation });

        }
    };

    useEffect(() => {
        fromToFetch(xAxesValues.xAxisMin, xAxesValues.xAxisMax);
    }, [xAxesValues]);

    const fromToFetch = async (min: number, max: number) => {
        const response = await API.annot(min, 20000);
        setIsLoading(true);

        try {
            // const response = await axios.get(apiData);
            const newData = response?.data;
            const checking = newData;
            setData((prevData: any) => [...prevData, ...newData]);
            setIsLoading(false); // Hide the loading indicator
            // setData(newData);
            // setVisibleData(newData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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
            tickPixelInterval: 100,
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
            turboThreshold: 100000,

            // data: [{
            //     x: Date.UTC(2014, 10, 21),
            //     x2: Date.UTC(2014, 11, 2),
            //     y: 0,
            //     partialFill: 0.25
            // }, {
            //     x: Date.UTC(2014, 11, 2),
            //     x2: Date.UTC(2014, 11, 5),
            //     y: 1
            // }, {
            //     x: Date.UTC(2014, 11, 8),
            //     x2: Date.UTC(2014, 11, 9),
            //     y: 2
            // }, {
            //     x: Date.UTC(2014, 11, 9),
            //     x2: Date.UTC(2014, 11, 19),
            //     y: 1
            // }, {
            //     x: Date.UTC(2014, 11, 10),
            //     x2: Date.UTC(2014, 11, 23),
            //     y: 2
            // }],
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
            data: [],
            turboThreshold: 100000,
        },

        ],
        navigator: {
            enabled: true // enable the navigator
        },
        scrollbar: {
            enabled: true // enable the scrollbar
        },
        rangeSelector: {
            enabled: false // enable the range selector
        }

    };

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.chart.reflow();
        }
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataMappingForAnnotation(data, chart);
        }
    }, [data]);



    return (
        // <div style={{ width: 1000 }}>
        <div>
            {isLoading ? <div>Loading...</div> :
                <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} isLoading={isLoading}
                    constructorType={'stockChart'} // use stockChart constructor
                />
            }
        </div>
    );
};

export default memo(Annotation);
