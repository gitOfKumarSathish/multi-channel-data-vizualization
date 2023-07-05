import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import { IChartData, IDataElementTypeThree, IProps, ISrcChannel, IZoomRange } from './API/interfaces';
import { useContext } from 'react';
import { ZoomContext } from './Charts';

HighchartsStock(Highcharts); // initialize the Stock module

const DataTypeThree = (props: IProps) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit, src_channels, plotValue } = props.configs;
    const { minimap, combineZoom } = props.userConfig;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [start, setStart] = useState(0);
    const [data, setData] = useState<IChartData[]>([]);
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
            dataMapping(data, setSetXCategory, chart);
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
            marginRight: 10,
            zoomType: "x",
            panning: true,
            panKey: 'shift',
            events: {
                load: function (this: any) {
                    const chart = this;
                    const resetZoomButton = chart?.renderer.button(
                        'Reset Zoom',
                        null,
                        null,
                        function () {
                            chart.xAxis[0].setExtremes(null, null);
                            chart.yAxis[0].setExtremes(null, null);
                        }
                    )
                        .attr({
                            // align: 'right',
                            'vertical-align': 'top',
                            y: 65,
                            x: 0,
                            zIndex: 9999
                        })
                        .addClass('reset-zoom-button')
                        .add();

                    // Position the button dynamically if the chart width changes
                    chart.updateResetZoomButtonPosition = function () {
                        resetZoomButton.attr({
                            x: chart.chartWidth - resetZoomButton.width - 10
                        });
                    };

                    // Update the button position initially and on chart resize
                    chart.updateResetZoomButtonPosition();
                    window.addEventListener('resize', chart.updateResetZoomButtonPosition);
                },
                // selection: function (event) {
                //     const chart = this;

                //     if (event.xAxis) {
                //         // User has zoomed in, show the reset zoom button
                //         chart.showResetZoomButton();
                //     } else {
                //         // User has reset the zoom, hide the reset zoom button
                //         chart.hideResetZoomButton();
                //     }
                // }



            }
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

export default memo(DataTypeThree);

function dataMapping(data: IChartData[], setSetXCategory: (value: string[]) => void, chart: any) {
    const updatedCategories = data.flatMap((channelData: IChartData) => {
        return channelData.data.map((val) => val?.ts.toFixed(2));
    });
    setSetXCategory(updatedCategories);

    // chart.update({ series: seriesData }, false);
    chart.xAxis[0].setCategories(updatedCategories, false);
}

async function channelMapping(src_channels: ISrcChannel[], start: number, newStart: number, data: IChartData[], setData: (value: IChartData[]) => void) {
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
            const existingChannelIndex = data.findIndex((item) => item.channel === response.channel);

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