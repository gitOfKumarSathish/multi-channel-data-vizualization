import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limit } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module



const loadMoreBackupTypeThree = () => {


    const chartRef = useRef<HighchartsReact.Props>(null);

    const [data, setData] = useState<any>([]);

    const options = {
        chart: {
            type: "line",
            // animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: "loadMoreBackupTypeThree",
        },
        xAxis: {
            // type: "datetime",
            tickPixelInterval: 100,
            labels: {
                formatter(this: any): string {
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
        },
        tooltip: {
            formatter(this: any): string {
                console.log('this.tooltip', this);
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
            enabled: true, // enable the navigator
            // xAxis: {
            //     min: 0, // set the minimum value to the start of the current month
            //     max: 10000 // set the maximum value to the end of the third month from now
            // }
        },
        scrollbar: {
            enabled: true // enable the scrollbar
        },
        rangeSelector: {
            enabled: false // enable the range selector
        },
    };
    const [xAxisCategory, setXAxisCategory] = useState<any>([]);
    const [start, setStart] = useState(0);



    const fetchData = async () => {
        const newStart = start + limit;
        const response = await API.mixed(start, newStart);
        setStart(newStart);
        console.log('response.data', response.data);
        const newDataSet = response.data.map((val: { values: { mean: any; }; }) => val?.values?.mean);
        setData((prevData: any) => [...prevData, ...newDataSet]);
        const xTimeStamp = response.data.map((val: { ts: any; }) => val.ts);
        setXAxisCategory((prevData: any) => [...prevData, ...xTimeStamp]);
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        console.log('xAxisCategory', xAxisCategory);
        if (chart) {
            chart.update({ series: [{ data }] }, { xAxis: [{ categories: xAxisCategory }], });
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };
    return (
        <div style={{ width: 1000 }}>
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

export default memo(loadMoreBackupTypeThree);;