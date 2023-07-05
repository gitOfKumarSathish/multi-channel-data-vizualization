import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import xrange from "highcharts/modules/xrange";
import HighchartsBoost from 'highcharts/modules/boost';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

import * as API from './API/API';
import { ZoomContext } from './Charts';
import { IChannelDataTypeFour, IProps, ISingleChannelData, ISrcChannel, IZoomRange } from './API/interfaces';
import { defaultZoomBehavior, explicitChannelMapping, settingZoomInGlobalStore, updatingZoomFromGlobalStore } from './globalConfigs';

HighchartsStock(Highcharts); // initialize the module
xrange(Highcharts);
HighchartsBoost(Highcharts);
let Yaxis: string[] = [];

const DataTypeFour = (props: IProps) => {
    // Props Received from the Charts.tsx component from Backend API
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels } = props.configs;
    // Props Received from the Charts.tsx component from userConfig
    const { minimap, combineZoom } = props.userConfig;
    // Create Chart Reference
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<IChannelDataTypeFour[]>([]); // handling Data for visualization
    const [start, setStart] = useState(0); // handling for API from , to counts 
    const [xAxisCategory, setXAxisCategory] = useState<string[]>([]); // handling X-Axis for Data
    const [plotting, setPlotting] = useState<IChannelDataTypeFour[]>([]); // handling X-Axis for plotting in Chart
    const zoomLevel = useContext(ZoomContext); // Access Global Properties ZoomLevel
    const [legendName, setLegendName] = useState<string>(''); // legend for the chart

    const fetchData = async () => {
        const newStart = start + data_limit;
        setStart(newStart);
        // Note: Mapping Data based on src_channels 
        await explicitChannelMapping(src_channels, start, newStart, data, setData);
    };

    useEffect(() => {
        // when component Loaded respective API from the backend
        fetchData();
    }, []);

    useEffect(() => {
        // Any changes happening data will be called and updated the charts
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataMapping(data, setXAxisCategory, setPlotting, setLegendName); // Mapping the Data based on the data Type

            // Handling Zoom and setting the zoom level in Global Store
            chart.update({
                xAxis: {
                    events: {
                        // afterSetExtremes: syncCharts
                        afterSetExtremes: function (e: IZoomRange) {
                            settingZoomInGlobalStore(combineZoom, e, props);
                        },
                    }
                },
            });
        }
    }, [data]);

    useEffect(() => {
        // updating the Zoom level from the Global Store if any changes are made on other charts
        updatingZoomFromGlobalStore(chartRef, zoomLevel, combineZoom);
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
    const Options = {
        chart: {
            type: String(chart_type),
            // animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift'
        },

        title: {
            text: String(chart_title),
        },
        xAxis: {
            // type: "datetime",
            tickPixelInterval: 100,
            labels: {
                formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                    return String(this.value);
                },
            },
            title: {
                text: String(x_label),
            },
        },
        yAxis: {
            opposite: false,
            lineWidth: 1,
            title: {
                text: String(y_label),
            },
            categories: xAxisCategory

        },
        tooltip: {
            shared: true,
            formatter(this: Highcharts.TooltipFormatterContextObject): string {
                if (this && this.points) {
                    let tooltip = '<b>' + 'ts : ' + this.x + '</b><br/>';
                    this.points.forEach(function (point: Highcharts.Point): void {
                        const x = point.x.toFixed(2);
                        const x2 = point.x2 != null ? point.x2.toFixed(2) : '';
                        const yCategory = point?.yCategory !== null ? point.yCategory.toString() : '';
                        tooltip += `<b>${x} - ${x2}</b><br/><b>${yCategory}</b>`;
                    });
                    return tooltip;
                } else {
                    return '';
                }
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
        series: [
            {
                name: legendName,
                data: plotting,
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
        ],

        navigator: {
            enabled: Boolean(minimap === undefined ? true : minimap),
            // enabled: false,
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                        const xValue = this.value;
                        return String(xValue);
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
                options={Options}
                constructorType={'stockChart'} // use stockChart constructor
            />
            <button onClick={handlePan} className='loadMoreButton'>Load More</button>
        </div>
    );
};
// type: IChannelDataTypeFour 
export default memo(DataTypeFour);

function dataMapping(data: any[],
    setXAxisCategory: (value: string[]) => void,
    setPlotting: (value: any) => void, setLegendName: (channel: string) => void): void {
    let uniqueArray: string[] = [];
    // looping the initial data from the local state 
    data.map((channelData) => {
        channelData?.data?.map((singleChannelData: ISingleChannelData) => {
            Yaxis.push(singleChannelData.tag);
            uniqueArray = [...new Set(Yaxis)];
            setXAxisCategory(uniqueArray);
            const chartData = {
                x: singleChannelData.bt,
                x2: singleChannelData.tt,
                y: uniqueArray.indexOf(singleChannelData.tag),
                title: singleChannelData.tag,
            };
            // setting the legend
            setLegendName(channelData.channel);
            // data prepared to display in the chart
            setPlotting((prevData: any) => [...prevData, chartData]);
        });
    });
}