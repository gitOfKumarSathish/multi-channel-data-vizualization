import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

import { defaultZoomBehavior, epochConverted } from './globalConfigs';
import { IChannelMappingResponse, IProps, ISample, ISrcChannel, IZoomRange } from './API/interfaces';
import { ZoomContext } from './Charts';
import * as API from './API/API';

HighchartsStock(Highcharts); // initialize the module

const DataTypeOne = (props: IProps) => {
    // Props Received from the Charts.tsx component from Backend API
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    // Props Received from the Charts.tsx component from userConfig
    const { minimap, combineZoom } = props.userConfig;
    // Create Chart Reference
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<IChannelMappingResponse[]>([]); // handling Data for visualization
    const [start, setStart] = useState(0); // handling for API from , to counts 
    const [xCategory, setXCategory] = useState<string[]>([]); // handling X-Axis for plotting
    const zoomLevel = useContext(ZoomContext); // Access Global Properties ZoomLevel

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);
        // Note: Mapping Data based on src_channels 
        await channelMapping(src_channels, start, newStart, data, setData);
    };

    useEffect(() => {
        // when component Loaded respective API from the backend
        fetchData();
    }, []);

    useEffect(() => {
        // Any changes happening data will be called and updated the charts
        const chart = chartRef.current?.chart;
        if (chart) {
            const updatedSeries = dataMapping(data); // Mapping the Data based on the data Type
            const yAxisData = updatedSeries?.flat().map((series: ISample) => series.value);
            const xAxisTs = updatedSeries?.flat().map((series: ISample) => series.time);
            // Update X Axis Data which is ts
            setXCategory(xAxisTs);
            // Update Y Axis Data 
            chart.update({ series: [{ data: yAxisData }] }, false);

            // Handling Zoom and setting the zoom level in Global Store
            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        afterSetExtremes: function (e: IZoomRange) {
                            // console.log('e', e);
                            if (combineZoom === undefined ? true : combineZoom) { // handling Whether user opted for combineZoom 
                                if (e.trigger === 'navigator' || e.trigger === 'zoom') { // Stop unnecessary rendering
                                    props.onZoomChange(e.min, e.max); // updating the Zoom level in the Global Store 
                                }
                            }
                        },
                    }
                },
            });
            // Re-Draw the chart default behavior of the Highcharts
            chart.redraw();
        }
    }, [data]);

    useEffect(() => {
        // updating the Zoom level from the Global Store if any changes are made on other charts
        const chart = chartRef.current?.chart;
        if (chart && zoomLevel && combineZoom === undefined ? true : combineZoom) {
            chart.xAxis[0].setExtremes(zoomLevel?.min, zoomLevel?.max); // update the Zoom level
        }
    }, [zoomLevel]);

    const handlePan = () => {
        // when LoadMore is clicked calling the next set of data from backend
        fetchData();
    };

    // Chart Options
    /* 
        Note: in xAxis.categories are responsible for the x axis data,
            series are responsible for the y axis data.
    
    */
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
            categories: xCategory,

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
                        return xCategory[xValue];
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
    // looping the initial data from the local state 
    return data.map((channel: IChannelMappingResponse) => {
        // extracting { data, sr, ts } 
        let { data, sr, ts } = channel.data;
        // converting the backend time to Epoch time and with proper sample rate and interval
        let timeDifferBetweenSamples = sr / (1000 * 1000);
        let sampleTime = ts;
        let sampledData: ISample[] = [];
        data.forEach((sampleValue: number, index: number) => {
            if (index !== 0) {
                // increment sampleTime based on time difference between them
                sampleTime = sampleTime + timeDifferBetweenSamples;
            }
            let sample = { value: sampleValue, time: epochConverted(sampleTime) }; // conversion fo epoch time to human readable
            sampledData.push(sample);
        });
        return sampledData;
    });
}

async function channelMapping(src_channels: ISrcChannel[], start: number, newStart: number, data: IChannelMappingResponse[], setData: (value: IChannelMappingResponse[]) => void) {
    const promises = src_channels.map(async (eachChannel: { channel: string; }) => {
        /* Note: calling API based on src_channel where key is mentioned as 'channel' */
        const response = await API.getData(eachChannel.channel, start, newStart);
        return {
            channel: eachChannel.channel,
            data: response.data
        };
    });

    try {
        /* 
            Mapping the promises output for respective channels, 
            example: [ { channel: wf, data: [set Of Data]} ,{ channel: wf, data: [set Of Data]}]  
         */
        const responses = await Promise.all(promises);
        responses.map((response) => {
            // checking channel is Existing or not  if yes push the new set of data to 'data' array, if not creating a new channel with 'data' array
            const existingChannelIndex = data.findIndex((item: { channel: string; }) => item.channel === response.channel);
            if (existingChannelIndex !== -1) {
                (data[existingChannelIndex].data.data).push(...response.data.data);
            }
            else {
                data.push(response);
            }
        });
        // setting Data for the Chart
        setData([...data]);
    } catch (error) {
        console.error('Error fetching data For Type 1:', error);
    }
};