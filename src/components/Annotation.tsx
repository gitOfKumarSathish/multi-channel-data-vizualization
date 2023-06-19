import React, { useRef, useEffect, memo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import xrange from "highcharts/modules/xrange";
import * as API from './API/API';

// Initialize HighchartsMore module
xrange(Highcharts);
const Annotation = (props: any) => {
    const { channel, chart_type, x_label, y_label } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);

    const options = {
        chart: {
            type: String(chart_type),
            zoomType: 'x',
            panKey: 'shift',
            panning: true,
        },
        title: {
            text: String(channel)
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
        legend: {
            enabled: false, // Disable legends
        },
        series: [{
            name: { channel },
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
        }]

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
            const dataFromAPI = data[0]?.data;
            const chartCategory = dataFromAPI?.map((plot: { tag: any; }) => plot.tag);
            const uniqueArray = [...new Set(chartCategory)];

            const chartData = dataFromAPI?.map((plot: { bt: any; tt: any; tag: string; }) => ({
                x: plot.bt,
                x2: plot.tt,
                y: uniqueArray.indexOf(plot.tag),
                title: plot.tag,
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
        <div style={{ width: 1000 }}>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>
    );
};

export default memo(Annotation);