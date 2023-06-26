import { useState, useEffect, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module

const MyChartss = () => {
    const [chartOptions, setChartOptions] = useState({
        chart: {
            type: 'line',
            zoomType: 'x',
            height: 500
        },
        title: {
            text: 'My Stock Chart'
        },
        xAxis: {
            type: 'datetime'
        },
        series: [{
            data: [] // empty data array to be populated by API data
        }]
    });

    const chartRef = useRef(null); // create a ref to the Highcharts chart component

    useEffect(() => {
        // fetch initial data from API and update chartOptions with new data
        fetchData().then(data => {
            setChartOptions({
                ...chartOptions,
                series: [{
                    data: data
                }],
                navigator: {
                    enabled: true // enable the navigator
                },
                scrollbar: {
                    enabled: true // enable the scrollbar
                },
                rangeSelector: {
                    enabled: true // enable the range selector
                },
                xAxis: {
                    events: {
                        afterSetExtremes: (e) => {
                            if (e.trigger === 'navigator') {
                                const range = e.max - e.min; // calculate range of chart
                                const left = e.min - (range / 2); // calculate new left extreme
                                const right = e.max + (range / 2); // calculate new right extreme
                                // fetch new data based on new extremes
                                fetchData(left, right).then(newData => {
                                    // update chart series with new data
                                    const chart = chartRef.current.chart;
                                    chart.series[0].setData(newData);
                                });
                            }
                        }
                    }
                }
            });
        });
    }, []);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'} // use stockChart constructor
            options={chartOptions}
            ref={chartRef} // assign the ref to the chart component
        />
    );
};

export default MyChartss;