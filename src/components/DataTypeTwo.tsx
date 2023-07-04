import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import { ZoomContext } from './Charts';
import { IProps } from './API/interfaces';

HighchartsStock(Highcharts); // initialize the Stock module
const DataTypeTwo = (props: IProps) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);
    const [setXCategory, setSetXCategory] = useState<any>([]);
    const zoomLevel = useContext(ZoomContext);

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);
        // Note: Mapping Data based on src_channels 
        await dataMapping(src_channels, start, newStart, data, setData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            const updatedCategories = data.flatMap((channelData: any) => {
                return channelData.data.map((val: { ts: any; }) => val?.ts);
            });
            setSetXCategory(updatedCategories);



            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        setExtremes: function (e: { min: any; max: any; }) {
                            console.log('e', e);
                            props.onZoomChange(e.min, e.max);
                        },
                    }
                },
            });
        }
    }, [data]);

    // useEffect(() => {
    //     const chart = chartRef.current?.chart;
    //     console.log('zoomLevel', zoomLevel);
    //     if (chart && zoomLevel) {
    //         chart.xAxis[0].setExtremes(zoomLevel.min, zoomLevel.max);
    //     }

    // }, [zoomLevel, chartRef.current?.chart]);


    const handlePan = () => {
        fetchData();
    };

    const options = {
        chart: {
            type: String(chart_type),
            // animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: "x",
            panning: true,
            panKey: 'shift',
        },
        title: {
            text: String(chart_title),
        },
        xAxis: {
            labels: {
                rotation: -10,
                formatter(this: any): string {
                    // Convert the timestamp to a date string
                    return this.value;
                }
            },
            title: {
                text: String(x_label),
            },
            tickLength: 10,
            categories: setXCategory,
        },
        yAxis: {
            lineWidth: 1,
            opposite: false,
            // type: 'logarithmic',
            title: {
                text: String(y_label),
            },
        },

        tooltip: {
            shared: true,
            formatter(this: any): string {
                let tooltip = '<b>' + 'ts : ' + this.x + '</b><br/>';
                this.points.forEach(function (point: { series: { name: string; }; y: string; }) {
                    tooltip += '<b>' + point.series.name + ': ' + point.y + '</b><br/>';
                });
                return tooltip;
            }
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
                data: x.data.map((y: any) => y.value),
                name: x.channel,
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
        navigation: {
            buttonOptions: {
                enabled: true
            }
        },
        navigator: {
            enabled: Boolean(miniMap), // enable the navigator
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: any): string {
                        const xValue = this.value;
                        return (setXCategory[xValue]);
                    },
                },
            }
        },
        scrollbar: {
            enabled: false // enable the scrollbar
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

export default memo(DataTypeTwo);

async function dataMapping(src_channels: any, start: number, newStart: any, data: any, setData: { (value: any): void; (arg0: any[]): void; }) {
    const promises = src_channels.map(async (eachChannel: { channel: string; }) => {
        const response = await API.getData(eachChannel.channel, start, newStart);
        // const seriesData = response.data.map((item: any) => [item.ts, item.value]);
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
