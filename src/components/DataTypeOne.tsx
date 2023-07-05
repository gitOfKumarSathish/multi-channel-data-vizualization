import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import { defaultZoomBehavior, epochConverted } from './globalConfigs';
import { IChannelMappingResponse, IProps, ISample, ISrcChannel, IZoomRange } from './API/interfaces';
import { ZoomContext } from './Charts';

HighchartsStock(Highcharts); // initialize the Stock module

const DataTypeOne = (props: IProps) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    const { minimap, combineZoom } = props.userConfig;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<IChannelMappingResponse[]>([]);
    const [start, setStart] = useState(0);
    const [setXCategory, setSetXCategory] = useState<string[]>([]);
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
            const updatedSeries = dataMapping(data);
            const yAxisData = updatedSeries?.flat().map((series: ISample) => series.value);
            const xAxisTs = updatedSeries?.flat().map((series: ISample) => series.time);
            setSetXCategory(xAxisTs);
            chart.update({ series: [{ data: yAxisData }] }, false);


            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        afterSetExtremes: function (e: IZoomRange) {
                            // console.log('e', e);
                            if (combineZoom === undefined ? true : combineZoom) {
                                if (e.trigger === 'navigator' || e.trigger === 'zoom') {
                                    props.onZoomChange(e.min, e.max);
                                }
                            }
                        },
                    }
                },
            });

            chart.redraw();
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
            // type: "datetime",
            tickPixelInterval: 100,
            title: {
                text: String(x_label)
            },
            // categories: [],
            categories: setXCategory,

            labels: {
                rotation: -25,
                formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                    // Convert the timestamp to a date string
                    return String(this.value);
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
            formatter(this: Highcharts.TooltipFormatterContextObject): string {
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
        series: data.map((channel: IChannelMappingResponse) => (
            {
                name: channel.channel,
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
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                        // return this.point?.title;
                        return String(this.value);
                    }
                },
            }
        )),
        navigator: {
            enabled: Boolean(minimap === undefined ? true : minimap), // enable the navigator
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): string | number {
                        // Format the label based on the x-axis value
                        const xValue: any = this.value || '';
                        return setXCategory[xValue];
                    },
                },
            }
        },
        scrollbar: {
            enabled: false // enable the scrollbar
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

function dataMapping(data: IChannelMappingResponse[]): ISample[][] {
    return data.map((channel: IChannelMappingResponse) => {
        let { data, sr, ts } = channel.data;

        let timeDifferBetweenSamples = sr / (1000 * 1000);
        let sampleTime = ts;
        let sampledData: ISample[] = [];
        data.forEach((sampleValue: number, index: number) => {
            if (index !== 0) {
                sampleTime = sampleTime + timeDifferBetweenSamples;
            }
            let sample = { value: sampleValue, time: epochConverted(sampleTime) };
            sampledData.push(sample);
        });
        return sampledData;
    });
}

async function channelMapping(src_channels: ISrcChannel[], start: number, newStart: number, data: IChannelMappingResponse[], setData: (value: IChannelMappingResponse[]) => void) {
    const promises = src_channels.map(async (eachChannel: { channel: string; }) => {
        const response = await API.getData(eachChannel.channel, start, newStart);
        return {
            channel: eachChannel.channel,
            data: response.data
        };
    });

    try {
        const responses = await Promise.all(promises);
        responses.map((response) => {
            const existingChannelIndex = data.findIndex((item: { channel: string; }) => item.channel === response.channel);
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