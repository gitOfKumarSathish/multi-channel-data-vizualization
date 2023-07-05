import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import { ZoomContext } from './Charts';
import { IChannelData, IDataElement, IProps, ISrcChannel, IZoomRange } from './API/interfaces';
import { defaultZoomBehavior } from './globalConfigs';

HighchartsStock(Highcharts); // initialize the Stock module
const DataTypeTwo = (props: IProps) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const { minimap, combineZoom } = props.userConfig;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<IChannelData[]>([]);
    const [start, setStart] = useState(0);
    const [setXCategory, setSetXCategory] = useState<number[]>([]);
    const zoomLevel = useContext(ZoomContext);

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);
        // Note: Mapping Data based on src_channels 
        await channelMapping(src_channels, start, newStart, data, setData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            const updatedCategories = data.flatMap((channelData: IChannelData) => {
                return channelData.data.map((val: IDataElement) => val.ts);
            });
            setSetXCategory(updatedCategories);

            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        afterSetExtremes: function (e: IZoomRange) {
                            if (combineZoom === undefined ? true : combineZoom) {
                                if (e.trigger === 'navigator' || e.trigger === 'zoom') {
                                    props.onZoomChange(e.min, e.max);
                                }
                            }
                        },
                    }
                },
            });
        }
    }, [data]);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && zoomLevel && combineZoom === undefined ? true : combineZoom) {
            chart.xAxis[0].setExtremes(zoomLevel?.min, zoomLevel?.max);
        }

    }, [zoomLevel]);


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
            events: {
                load: function (this: any) {
                    defaultZoomBehavior.call(this);
                },
            }
        },
        title: {
            text: String(chart_title),
        },
        xAxis: {
            labels: {
                rotation: -10,
                formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                    // Convert the timestamp to a date string
                    return String(this.value);
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
        series: data.map((x: IChannelData) => (
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
                    // formatter(this: any): string {
                    //     return this.point?.title;
                    // },
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                        return String(this.value);
                    }
                },
            }
        )),
        navigation: {
            buttonOptions: {
                enabled: true
            }
        },
        navigator: {
            enabled: Boolean(minimap === undefined ? true : minimap),
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): string | number {
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

async function channelMapping(src_channels: ISrcChannel[], start: number, newStart: number, data: any[], setData: (value: any) => void) {
    const promises = src_channels.map(async (eachChannel: { channel: string; }) => {
        const response = await API.getData(eachChannel.channel, start, newStart);
        return {
            channel: eachChannel.channel,
            data: response.data
        };
    });

    try {
        const responses = await Promise.all(promises);
        responses.forEach((response) => {
            const existingChannelIndex = data.findIndex((item: { channel: string; }) => item.channel === response.channel);

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
