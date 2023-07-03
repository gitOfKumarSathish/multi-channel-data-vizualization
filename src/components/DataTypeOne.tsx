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
        if (chart) {
            const updatedSeries = data.map((channel: any) => {
                let { data, sr, ts } = channel.data;

                let timeDifferBetweenSamples = sr / (1000 * 1000);
                let sampleTime = ts;
                let sampledData: any = [];
                data.forEach((sampleValue: number, index: number) => {
                    if (index !== 0) {
                        sampleTime = sampleTime + timeDifferBetweenSamples;
                    }
                    let sample = { value: sampleValue, time: sampleTime };
                    sampledData.push(sample);
                });
                return {
                    sampledData
                };
            });

            const dra = updatedSeries?.map((series: any) => {
                return series.sampledData.map(x => x.value);
            });

            const vv = updatedSeries?.map((series: any) => {
                return series.sampledData.map(x => epochConverted(x.time));
            });
            // const vv = updatedSeries?.map((series: any) => series.sampleData?.map((s: any) => { s.time; })
            // );
            // const vv = updatedSeries?.local?.map((series: any) => series.data.map(val => val.time));
            chart.xAxis[0].setCategories(vv[0], false);
            chart.update({ series: [{ data: dra[0] }] }, false);
            chart.redraw();
        }
    }, [data]);

    const epochConverted = (time: number) => {
        const epochTime = time;
        const date = new Date(epochTime);
        const localISOTimeString = date.toLocaleString();
        return (localISOTimeString.split(',')[1]).trim();
    };

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
            tickPixelInterval: 100,
            title: {
                text: String(x_label)
            },
            // tickLength: 10,
            categories: [],
            labels: {
                rotation: -25,
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
        series: data.map((_) => (
            {

                data: [],
                // data: [],
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
        const response = await API.getData(eachChannel.channel, start, newStart);
        return {
            channel: eachChannel.channel,
            data: response.data
        };
    });

    try {
        const responses = await Promise.all(promises);
        responses.map((response, i) => {
            const existingChannelIndex = data.findIndex((item: any) => item.channel === response.channel);
            if (existingChannelIndex !== -1) {
                (data[existingChannelIndex].data.data).push(...response.data.data);
            }
            else {
                data.push(response);
            }
        });
        setData([...data]);
    } catch (error) {
        console.error('Error fetching data For Type 1:', error);
    }
};