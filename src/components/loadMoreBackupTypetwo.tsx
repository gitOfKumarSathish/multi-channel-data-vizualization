import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { PythonData } from '../assets/data';
import { limit } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module
// import PythonData from './../assets/data.json';

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
        labels: {
            formatter: function () {
                // Convert the timestamp to a date string
                return this.value;
            }
        }
    },
    yAxis: {
        opposite: false,
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
        // formatter(this: any): string {
        //     return `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M:%S", this.x)}</b><br/><b>${this.y}</b>`;
        // },
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
            name: "Random data",
            data: [],
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
    },
};

const LoadMoreBackup = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [options, setOptions] = useState<any>(initialOptions);

    const [data, setData] = useState<any>([]);
    const [xAxisCategory, setXAxisCategory] = useState<any>([]);
    const [start, setStart] = useState(0);

    // const fetchData = async () => {
    //     const response = await API.getFuncNodes(start + limit);
    //     const newData = response.data.slice(start, start + limit);
    //     setStart(start + limit);
    //     setData([...data, ...newData]);
    // };

    const fetchData = async () => {
        const newStart = start + limit;
        const response = await API.volumePanning(start, newStart);
        console.log('respping', response.data);

        const bb = response.data.map(x => x.value);
        console.log('bb', bb);
        const cc = response.data.map(x => x.ts);
        console.log('cc', cc);
        const newData = response.data.slice(start, newStart);
        setStart(newStart);
        setData((prevData: any) => [...prevData, ...bb]);
        setXAxisCategory((prevData: any) => [...prevData, ...cc]);
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            chart.update({ series: [{ data }] }, { xAxis: [{ categories: xAxisCategory }], });
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };





    return (
        // <div style={{ width: 1000 }}>
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
                constructorType={'stockChart'} // use stockChart constructor
            />
            <button onClick={handlePan}>Load More</button>
        </div>
    );
};

export default memo(LoadMoreBackup);