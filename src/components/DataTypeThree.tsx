import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import { IProps } from './API/interfaces';

HighchartsStock(Highcharts); // initialize the Stock module

const DataTypeThree = (props: IProps) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [start, setStart] = useState(0);
    const [data, setData] = useState<any[]>([]);
    const [setXCategory, setSetXCategory] = useState<any>([]);

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);

        // Data Mapping 
        await dataMapping(src_channels, start, newStart, data, setData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            // chart.update({ series: [{ data }] }, false);
            // chart.xAxis[0].setCategories(xAxisCategory, false);
            // chart.redraw();

            const seriesData = data.map((channelData: any) => {
                const series = {
                    name: channelData.channel,
                    data: channelData.data.map((val: { values: { mean: any; }; }) => val?.values?.mean),
                };

                return series;
            });

            const updatedCategories = data.flatMap((channelData: any) => {
                return channelData.data.map((val: { ts: number; }) => val?.ts.toFixed(2));
            });
            setSetXCategory(updatedCategories);

            chart.update({ series: seriesData }, false);
            chart.xAxis[0].setCategories(updatedCategories, false);


            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        setExtremes: function (e: { min: any; max: any; }) {
                            props.onZoomChange(e.min, e.max);
                        },
                    }
                },
            });

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
            marginRight: 10,
            zoomType: "x",
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: String(chart_title),
        },
        xAxis: {
            // categories: [],
            categories: setXCategory,
            // ordinal: false,
            title: {
                text: String(x_label),
            },
            labels: {
                rotation: -10,
                formatter(this: any): string {
                    // Convert the timestamp to a date string
                    return this.value;
                }
            },
            tickLength: 10,
        },
        yAxis: {
            lineWidth: 1,
            opposite: false,
            title: {
                text: String(y_label),
            },
            // ordinal: false,
        },
        tooltip: {
            shared: true,
            formatter(this: any): string {
                const xValue = this.x;
                const finalToolTipFormat = data.map((channelData) => {
                    const correspondingData = channelData.data.find((data: any) => {
                        return data.ts.toFixed(2) === xValue.toString();
                    });
                    // Generate the tooltip content using the corresponding data
                    let tooltipContent: string = '';
                    if (correspondingData) {
                        tooltipContent += `<br/><b>mean: ${correspondingData.values.mean}</b>`;
                        tooltipContent += `<br/><b>std: ${correspondingData.values.std}</b>`;
                        tooltipContent += `<br/><b>ts: ${correspondingData.ts}</b>`;
                    }
                    return tooltipContent;
                });
                return finalToolTipFormat[0];
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

                data: x.data.map((x: { values: { mean: string; }; }) => x.values.mean),
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
            enabled: Boolean(miniMap),
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: any): string {
                        const xValue = this.value;
                        const finalToolTipFormat = data.map((channelData) => {
                            // Format the label based on the x-axis value
                            const correspondingData = channelData.data[xValue];
                            return correspondingData?.ts;
                        });
                        return finalToolTipFormat[0];
                    },
                },
            }
        },
        scrollbar: {
            enabled: false,
        },
        rangeSelector: {
            enabled: false,
        },
    };

    return (
        <div className='chartParent'>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
                constructorType={'stockChart'}
            />
            <button onClick={handlePan} className='loadMoreButton'>Load More</button>
        </div>
    );
};

export default memo(DataTypeThree);

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
        responses.forEach((response: any) => {
            const existingChannelIndex = data.findIndex((item: any) => item.channel === response.channel);

            if (existingChannelIndex !== -1) {
                data[existingChannelIndex].data = [...data[existingChannelIndex].data, ...response.data];
            } else {
                data.push(response);
            }
        });
        setData([...data]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}