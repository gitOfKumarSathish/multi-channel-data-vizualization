import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { dataMappingForBasicChart, limit } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module

const LoadMoreBackup = (props: any) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [xAxisCategory, setXAxisCategory] = useState<any>([]);
    const [start, setStart] = useState(0);
    const [overAllData, setOverAllData] = useState<any[]>([]);

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);

        // const promises = src_channels.map((eachChannel: { channel: string; }) =>
        //     API.getData(eachChannel.channel, start, newStart)
        // );

        // try {
        //     const responses = await Promise.all(promises);
        //     // const newData = responses.reduce((acc: any[], response: any) => {

        //     //     acc.push(...response.data);
        //     //     return acc;
        //     // }, []);
        //     console.log('new data', responses);
        //     setData((prev: any) => [...prev, ...responses]);
        // } catch (error) {
        //     console.error('Error fetching data:', error);
        // }


        const response = await API.volume(start, newStart);
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
            console.log('data', data);
            // dataMappingForBasicChart(data, chart);
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
            // type: "line",
            type: String(chart_type),
            // animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift',
        },
        title: {
            text: String(chart_title),
        },
        xAxis: {
            tickPixelInterval: 100,
            tickmarkPlacement: 'on',
            labels: {
                formatter(this: any): string {
                    // Convert the timestamp to a date string
                    return this.value;
                }
            },
            title: {
                text: String(x_label),
            },
        },
        yAxis: {
            lineWidth: 1,
            opposite: false,

            // categories: xAxisCategory,
            // type: 'logarithmic',
            title: {
                text: String(y_label),
            },
        },
        tooltip: {
            formatter(this: any): string {
                return `<b>${this.x}</b><br/><b>${this.y}</b>`;
            },
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            align: 'center'
        },
        credits: {
            enabled: false,
        },
        exporting: {
            enabled: true,
        },
        // series: data.map(x => [{ data: [] }]),

        series: [
            {
                name: "Random data",
                data: data,
                turboThreshold: 100000,
                pointPadding: 1,
                groupPadding: 1,
                borderColor: 'gray',
                pointWidth: 20,
                dataLabels: {
                    enabled: false,
                    align: 'center',
                    style: {
                        fontSize: '14px',
                        fontWeight: 'bold',
                    },
                    formatter(this: any): string {
                        return this.point?.title;
                    },
                },

                // keys: ['y', 'id'],
                // data: [[29.9, '0'], [71.5, '1'], [106.4, '2']]
            },

        ],
        navigator: {
            enabled: Boolean(miniMap), // enable the navigator
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
        // style={{ width: 1000 }}
        <div className='chartParent'>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
                constructorType={'stockChart'} // use stockChart constructor
            />
            <button onClick={handlePan} className='loadMoreButton'>Load More</button>
        </div>
    );
};

export default memo(LoadMoreBackup);