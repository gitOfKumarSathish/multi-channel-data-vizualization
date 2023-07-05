import React, { memo, useEffect, useRef, useState } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

import * as API from './API/API';
import { IChartData, IDataElementTypeThree, IProps, ISrcChannel, IZoomRange } from './API/interfaces';
import { useContext } from 'react';
import { ZoomContext } from './Charts';
import { defaultZoomBehavior, explicitChannelMapping, settingZoomInGlobalStore, updatingZoomFromGlobalStore } from './globalConfigs';

HighchartsStock(Highcharts); // initialize the module

const DataTypeThree = (props: IProps) => {
    // Props Received from the Charts.tsx component from Backend API
    /* Note: plotValue will decide which value to plot in yaxis which is coming from backend api */
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels, plotValue } = props.configs;
    // Props Received from the Charts.tsx component from userConfig
    const { minimap, combineZoom } = props.userConfig;
    // Create Chart Reference
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [start, setStart] = useState(0); // handling for API from , to counts 
    const [data, setData] = useState<IChartData[]>([]);  // handling Data for visualization
    const [setXCategory, setSetXCategory] = useState<string[]>([]);  // handling X-Axis for plotting
    const zoomLevel = useContext(ZoomContext);

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
        if (chart) {
            dataMapping(data, setSetXCategory, chart); // Mapping the Data based on the data Type

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
            // Re-Draw the chart default behavior of the Highcharts
            chart.redraw();
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
    const options = {
        chart: {
            // type: "line",
            type: String(chart_type),
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift',
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
                formatter(this: Highcharts.AxisLabelsFormatterContextObject): string {
                    // Convert the timestamp to a date string
                    return String(this.value);
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
            formatter(this: Highcharts.TooltipFormatterContextObject): string {
                const xValue = this?.x || "";
                const finalToolTipFormat = data.map((channelData) => {
                    const correspondingData = channelData.data.find((data) => {
                        return (data.ts)?.toFixed(2) === xValue.toString();
                    });
                    // Generate the tooltip content using the corresponding data
                    let tooltipContent: string = '';
                    if (correspondingData) {
                        const generateHTML = (obj: any, parentKey = '') => {
                            let html = '';
                            for (const key in obj) {
                                if (typeof obj[key] === 'object') {
                                    html += generateHTML(obj[key], `${parentKey}${key}.`);
                                } else {
                                    html += `<div><b>${key}: ${obj[key]}</b></div> <br/>`;
                                }
                            }

                            return html;
                        };
                        tooltipContent += generateHTML(correspondingData);
                    }
                    return tooltipContent;
                });
                return finalToolTipFormat[0];
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
        series: data.map((x: IChartData) => (
            {

                data: x.data.map((x: { values: { [x: string]: string; }; }) => x.values[plotValue]),
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
        navigator: {
            enabled: Boolean(minimap === undefined ? true : minimap),
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: Highcharts.AxisLabelsFormatterContextObject): number {
                        const xValue: number = Number(this.value);
                        const finalToolTipFormat = data.map((channelData) => {
                            // Format the label based on the x-axis value
                            const correspondingData = channelData.data[Number(xValue)];
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
// type: IChartData 
export default memo(DataTypeThree);

function dataMapping(data: IChartData[], setSetXCategory: (value: string[]) => void, chart: any) {
    const updatedCategories = data.flatMap((channelData: IChartData) => {
        return channelData.data.map((val) => val?.ts.toFixed(2));
    });
    // Update X Axis Data which is ts
    setSetXCategory(updatedCategories);

    // chart.update({ series: seriesData }, false);
    // chart.xAxis[0].setCategories(updatedCategories, false);
}
