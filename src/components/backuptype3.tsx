import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limitForMixed } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module



const loadMoreBackupTypeThree = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
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
            categories: [],
            // type: 'linear',
            tickPixelInterval: 1,
            // labels: {
            //     formatter(this: any): string {
            //         console.log('this.tooltip', this);
            //         // Convert the timestamp to a date string
            //         return this.value;
            //     }
            // }
        },
        yAxis: {
            opposite: false,
            // type: 'logarithmic',
            title: {
                text: "Value",
            },
        },
        tooltip: {
            formatter(this: any): string {
                // console.log('this.tooltip', this);
                return `<b> x-Axis = ${this.x}</b><br/><b> y-Axis = ${this.y}</b>`;
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
            //     type: 'linear',
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
    const [data, setData] = useState<any>([]);


    const fetchData = async () => {
        const newStart = start + limitForMixed;
        const response = await API.mixed(start, newStart);
        setStart(newStart);
        // console.log('response.data', response.data);
        const newDataSet = response.data.map((val: { values: { mean: any; }; }) => val?.values?.mean);
        setData((prevData: any) => [...prevData, ...newDataSet]);
        const xTimeStamp = response.data.map((val: { ts: any; }) => val.ts);
        console.log('sasasa xTimeStamp', xTimeStamp);
        setXAxisCategory((prevData: any) => [...prevData, ...xTimeStamp]);
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        console.log('sasasa xAxisCategory', xAxisCategory);
        if (chart) {
            chart.update({ series: [{ data }] }, false);
            chart.xAxis[0].setCategories(xAxisCategory, false);
            chart.redraw();
            // chart.update({ series: [{ data }] }, { xAxis: [{ categories: xAxisCategory }], });
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

export default memo(loadMoreBackupTypeThree);