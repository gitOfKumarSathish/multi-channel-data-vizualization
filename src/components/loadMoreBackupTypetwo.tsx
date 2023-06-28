import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limit } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module



const LoadMoreBackup = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [xAxisCategory, setXAxisCategory] = useState<any>([]);
    const [start, setStart] = useState(0);
    const [overAllData, setOverAllData] = useState<any[]>([]);

    const fetchData = async () => {
        const newStart = start + limit;
        const response = await API.volume(start, newStart);
        setStart(newStart);
        setOverAllData((prevData: any) => [...prevData, ...response.data]);
        const newDataSet = response.data.map((val: { value: any; }) => val.value);
        setData((prevData: any) => [...prevData, ...newDataSet]);
        const xTimeStamp = response.data.map((val: { ts: any; }) => (val.ts).toFixed(2));
        setXAxisCategory((prevData: any) => [...prevData, ...xTimeStamp]);
    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            chart.update({ series: [{ data }] }, false);
            chart.xAxis[0].setCategories(xAxisCategory, false);
            chart.redraw();
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };

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
            text: "loadMoreBackupTypeTwo",
        },
        xAxis: {
            type: "linear",
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
            categories: [],
            type: 'logarithmic',
            title: {
                text: "Value",
            },
        },
        tooltip: {
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
            enabled: true, // enable the navigator
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: any): string {
                        const xValue = this.value;
                        const correspondingData = overAllData[xValue];
                        // Format the label based on the x-axis value
                        return correspondingData?.ts;
                    },
                },
            }
        },
        scrollbar: {
            enabled: true // enable the scrollbar
        },
        rangeSelector: {
            enabled: false // enable the range selector
        },
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