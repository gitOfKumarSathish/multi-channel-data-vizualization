import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { useEffect, useRef, useState } from 'react';
import * as API from './API/API';

const initialOptions = {
    chart: {
        // events: {
        //     load: async function () {
        //         // make API call and update chart data
        //         const { data } = await API.getFuncNodes();
        //         const chart = this;
        //         console.log({ data });
        //         chart?.update({ series: [{ data }] });
        //     }
        // },
        type: "line",
        animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        zoomType: "xy",
        panning: true,
        panKey: 'shift'
    },
    title: {
        text: "Real-time Time-series Graph",
    },
    xAxis: {
        // type: "datetime",
        tickPixelInterval: 100,
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
        formatter(): string {
            return `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x)}</b><br/><b>${this.y}</b>`;
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
};

const PanChart = () => {
    const chartRef = useRef<Highcharts.Chart | null>(null);
    const [options, setOptions] = useState<any>(initialOptions);

    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);

    const fetchData = async () => {
        const response = await API.getFuncNodes();
        const newData = response.data.slice(start, start + 10);
        setStart(start + 20);
        setData([...data, ...newData]);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            chart.update({ series: [{ data }] });
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };

    const handleRedraw = () => {
        const chart = chartRef.current?.chart;
        console.log('chart && chart.isInsidePlot(chart.pointer.chartX - chart.plotLeft, chart.pointer.chartY - chart.plotTop', chart.isInsidePlot(chart.pointer.chartX - chart.plotLeft, chart.pointer.chartY - chart.plotTop));
        if (chart && chart.isInsidePlot(chart.pointer.chartX - chart.plotLeft, chart.pointer.chartY - chart.plotTop)) {
            console.log('object');
            fetchData();
        }
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        console.log('chart', chart);
        if (chart) {
            console.log('update');

            chart.update({
                chart: {
                    events: {
                        redraw: handleRedraw,
                    },
                },
            });
        }
    }, []);





    return (
        <div style={{ width: 1000 }}>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
            />
            {/* <button onClick={handlePan}>Load More</button> */}
        </div>
    );
};

export default PanChart;