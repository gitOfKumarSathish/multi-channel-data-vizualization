import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limit, limitForWf } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module



const loadMoreBackupTypeOne = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);

    const fetchData = async () => {
        const newStart = start + limitForWf;
        const response = await API.waveForm(start, newStart);
        setStart(newStart);

        // const newDataSet = response.data.map((val: { value: any; }) => val.value);
        setData((prevData: any) => [...prevData, ...response.data]);

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
            text: "loadMoreBackupTypeOne",
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
                        // Format the label based on the x-axis value
                        const xValue = this.value;
                        return xValue;
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
        credits: {
            enabled: false
        },
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

export default memo(loadMoreBackupTypeOne);