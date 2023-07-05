import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

import * as API from './API/API';
import { ZoomContext } from './Charts';
import { IChannelData, IDataElement, IProps, ISrcChannel, IZoomRange } from './API/interfaces';
import { defaultZoomBehavior } from './globalConfigs';

HighchartsStock(Highcharts); // initialize the module
const DataTypeTwo = (props: IProps) => {
    // Props Received from the Charts.tsx component from Backend API
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    // Props Received from the Charts.tsx component from userConfig
    const { minimap, combineZoom } = props.userConfig;
    // Create Chart Reference
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<IChannelData[]>([]); // handling Data for visualization
    const [start, setStart] = useState(0); // handling for API counts 
    const [xCategory, setXCategory] = useState<number[]>([]); // handling X-Axis for plotting
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
            const updatedCategories = data.flatMap((channelData: IChannelData) => {
                return channelData.data.map((val: IDataElement) => val.ts);
            });
            // Update X Axis Data which is ts
            setXCategory(updatedCategories);

            // Handling Zoom and setting the zoom level in Global Store
            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        afterSetExtremes: function (e: IZoomRange) {
                            if (combineZoom === undefined ? true : combineZoom) { // handling Whether user opted for combineZoom 
                                if (e.trigger === 'navigator' || e.trigger === 'zoom') { // Stop unnecessary rendering
                                    props.onZoomChange(e.min, e.max); // updating the Zoom level in the Global Store 
                                }
                            }
                        },
                    }
                },
            });
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
            type: String(chart_type),
            // animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift',
            // events: {
            //     load: function (this: any) {
            //         defaultZoomBehavior.call(this);
            //     },
            // }
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
            categories: xCategory,
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
                        return (xCategory[xValue]);
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
           example: [ { channel: volume, data: [set Of Data]} ,{ channel: temp, data: [set Of Data]}]  
        */
        const responses = await Promise.all(promises);
        responses.forEach((response) => {
            const existingChannelIndex = data.findIndex((item: { channel: string; }) => item.channel === response.channel);
            // checking channel is Existing or not  if yes push the new set of data to 'data' array, if not creating a new channel with 'data' array
            if (existingChannelIndex !== -1) {
                data[existingChannelIndex].data = [...data[existingChannelIndex].data, ...response.data];
            } else {
                data.push(response);
            }
        });
        // setting Data for the Chart
        setData([...data]);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}
