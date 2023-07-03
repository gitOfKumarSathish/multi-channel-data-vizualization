import React, { useRef, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const Zoom = () => {
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);

    useEffect(() => {
        const chart1 = chart1Ref.current.chart;
        const chart2 = chart2Ref.current.chart;

        const syncCharts = (e) => {

            console.log('entering chart', e);
            if (e) {
                const { userMin, userMax } = e;
                chart1.xAxis[0].setExtremes(userMin, userMax, false);
                chart2.xAxis[0].setExtremes(userMin, userMax, false);
                chart1.redraw();
                chart2.redraw();
            }
            // if (e.xAxis) {
            //     // const { min, max } = e.xAxis[0];
            //     // chart1.xAxis[0].setExtremes(min, max, false);
            //     // chart2.xAxis[0].setExtremes(min, max, false);
            //     chart1.redraw();
            //     chart2.redraw();
            // } 
        };

        chart1.update({
            // chart: {
            //     events: {
            //         selection: syncCharts
            //     }
            // },
            xAxis: {
                events: {
                    afterSetExtremes: syncCharts
                }
            },
        });

        chart2.update({
            // chart: {
            //     events: {
            //         selection: syncCharts
            //     }
            // },
            xAxis: {
                events: {
                    afterSetExtremes: syncCharts
                }
            },

        });
    }, []);

    const options1 = {
        chart: {
            zoomType: "x",
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: "Chart 1"
        },
        xAxis: {
            type: "datetime"
        },
        series: [
            {
                data: [
                    [1622505600000, 5],
                    [1622592000000, 9],
                    [1622678400000, 14],
                    [1622764800000, 7],
                    [1622851200000, 11],
                    [1622505600000, 5],
                    [1622592000000, 9],
                    [1622678400000, 12],
                    [1622764800000, 7],
                    [1622851200000, 11],
                    [1622505600000, 15],
                    [1622592000000, 9],
                    [1622678400000, 14],
                    [1622764800000, 17],
                    [1622851200000, 11],
                    [1622505600000, 15],
                    [1622592000000, 19],
                    [1622678400000, 14],
                    [1622764800000, 27],
                    [1622851200000, 11]
                ]
            }
        ],
        navigator: {
            enabled: true, // enable the navigator
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
        },
    };

    const options2 = {
        chart: {
            zoomType: "x"
        },
        title: {
            text: "Chart 2"
        },
        xAxis: {
            type: "datetime"
        },
        series: [
            {
                data: [
                    [1622505600000, 5],
                    [1622592000000, 9],
                    [1622678400000, 14],
                    [1622764800000, 7],
                    [1622851200000, 11],
                    [1622505600000, 5],
                    [1622592000000, 9],
                    [1622678400000, 12],
                    [1622764800000, 7],
                    [1622851200000, 11],
                    [1622505600000, 15],
                    [1622592000000, 9],
                    [1622678400000, 14],
                    [1622764800000, 17],
                    [1622851200000, 11],
                    [1622505600000, 15],
                    [1622592000000, 19],
                    [1622678400000, 14],
                    [1622764800000, 27],
                    [1622851200000, 11]
                ]
            }
        ],
        navigator: {
            enabled: true, // enable the navigator
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
        },
    };

    return (
        <div>
            <div style={{ display: "inline-block", width: "50%" }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options1}
                    ref={chart1Ref}
                />
            </div>
            <div style={{ display: "inline-block", width: "50%" }}>
                <HighchartsReact
                    highcharts={Highcharts}
                    options={options2}
                    ref={chart2Ref}
                />
            </div>
        </div>
    );
};

export default Zoom;