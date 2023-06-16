import React, { useRef, useEffect, memo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import * as API from './API/API';

// Initialize HighchartsMore module
xrange(Highcharts);
const XseriesAnnotation = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);

    const options = {
        chart: {
            type: 'xrange'
        },
        title: {
            text: 'Highcharts X-range'
        },

        xAxis: {
            // type: 'datetime'
        },
        yAxis: {
            title: {
                text: ''
            },
            categories: [],
            reversed: false
        },
        tooltip: {
            formatter(this: any): string {
                return `<b>${this.x.toFixed(2) + ' - ' + this.x2.toFixed(2)}</b><br/><b>${this.yCategory}</b>`;
            },
        },
        legend: {
            enabled: false, // Disable legends
        },
        series: [{
            name: 'annot Type',
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
                    return this.point.title;
                },
            },
        }]

    };
    // console.log('dta', options.series);
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
        if (chart) {

            const chartCategory = data.map((plot: { data: { tag: any; }; }) => plot.data.tag);
            const uniqueArray = [...new Set(chartCategory)];
            console.log('uniqueArray', uniqueArray);

            const chartData = data.map((plot: { data: { bt: any; tt: any; tag: string; }; }) => ({
                x: plot.data.bt,
                x2: plot.data.tt,
                y: uniqueArray.indexOf(plot.data.tag),
                title: plot.data.tag,
                // color:plot.data.tag === 'normal' ? 'green' : 'red',
            }));


            chart.update({
                series: [{ data: chartData }],
                yAxis: [{ categories: uniqueArray }],
            });
        }
    }, [data]);

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
};

export default memo(XseriesAnnotation);