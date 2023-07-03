import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module

const DataTypeOne = (props: { configs: { chart_title: string; chart_type: string; x_label: string; y_label: string; miniMap: boolean; data_limit: number; src_channels: any; }; }) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);
        await dataMapping(src_channels, start, newStart, data, setData);

        // const response = await API.waveForm(start, newStart);
        // setData((prevData: any) => [...prevData, ...response.data]);

    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        console.log('data', data);
        if (chart) {
            const seriesData = data.map((channelData: any) => {
                const series = {
                    name: channelData.channel,
                    data: channelData.data.map((val: any[]) => val),
                };
                console.log('series', series);
                return series;
            });

            const updatedCategories = data.flatMap((channelData: any) => {
                return channelData.data.map((val: any[]) => val[0]?.toFixed(2));
            });

            chart.update({ series: seriesData }, false);
            chart.xAxis[0].setCategories(updatedCategories, false);
            chart.redraw();
            // chart.update({ series: [{ data }] });
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
            zoomType: "x",
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: String(chart_title),
        },
        xAxis: {
            // type: "datetime",
            // tickPixelInterval: 100,
            title: {
                text: String(x_label)
            },
            tickLength: 10,
            categories: [],
            labels: {
                rotation: -10,
                formatter(this: any): string {
                    // Convert the timestamp to a date string
                    return this.value;
                }
            }
        },
        yAxis: {
            lineWidth: 1,
            opposite: false,
            type: 'logarithmic',
            title: {
                text: String(y_label)
            },
        },
        tooltip: {
            shared: true,
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
        series: data.map((x: any) => (
            {

                data: x.data.map((x: any[]) => x[0]),
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
            }
        )),
        navigator: {
            enabled: Boolean(miniMap), // enable the navigator
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
        }
    };
    return (
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

export default memo(DataTypeOne);

async function dataMapping(src_channels: any, start: number, newStart: any, data: any, setData: { (value: any): void; (arg0: any[]): void; }) {
    const promises = src_channels.map(async (eachChannel: { channel: string; }) => {
        console.log('eachChannel', eachChannel);
        const response = await API.getData(eachChannel.channel, start, newStart);
        const seriesData = response.data.map((item: any) => [item.ts, item]);
        return {
            channel: eachChannel.channel,
            data: seriesData
        };
    });

    try {
        const responses = await Promise.all(promises);
        responses.forEach((response: any) => {
            const existingChannelIndex = data.findIndex((item: any) => item.channel === response.channel);

            if (existingChannelIndex !== -1) {
                data[existingChannelIndex].data = [...data[existingChannelIndex].data, ...response.data];
            } else {
                data.push(response);
            }
        });
        // console.log('data', data);
        setData([...data]);
    } catch (error) {
        console.error('Error fetching data For Type 1:', error);
    }
};