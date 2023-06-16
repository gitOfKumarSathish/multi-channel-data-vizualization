import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limit } from './Config';

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
        // animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        zoomType: "x",
        panning: true,
        panKey: 'shift'
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
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [options, setOptions] = useState<any>(initialOptions);

    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);

    const fetchData = async () => {
        const newStart = start + limit;
        const response = await API.getFuncNodes(newStart);
        const newData = response.data.slice(start, newStart);
        setStart(newStart);
        setData((prevData: any) => [...prevData, ...newData]);
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

    const handleRedraw = () => {
        // console.log('object');
        const chart = chartRef.current?.chart;
        chart?.current?.on('pan', (event: { chartX: any; chartY: any; }) => {
            const { chartX, chartY } = event;
            const isInsidePlot = chart.isInsidePlot(chartX - chart.plotLeft, chartY - chart.plotTop);
            if (isInsidePlot) {
                fetchData();
            }
        });
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        // console.log('chart', chart);
        if (chart) {
            // console.log('update');

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

export default memo(PanChart);