import { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module
import * as API from './API/API';
HighchartsStock(Highcharts); // initialize the Stock module

const MyChart = () => {
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

    useEffect(async () => {
        // fetch data from API and update chartOptions with new data
        const response = await API.volume(0, 10000);

        try {
            // const response = await axios.get(apiData);
            const newData = response?.data;
            console.log('response', response);
            setChartOptions({
                ...chartOptions,
                series: [{
                    data: newData
                }],
                navigator: {
                    enabled: true // enable the navigator
                },
                scrollbar: {
                    enabled: true // enable the scrollbar
                },
                rangeSelector: {
                    enabled: true // enable the range selector
                }
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        // fetchData().then(data => {
        //     setChartOptions({
        //         ...chartOptions,
        //         series: [{
        //             data: data
        //         }],
        //         navigator: {
        //             enabled: true // enable the navigator
        //         },
        //         scrollbar: {
        //             enabled: true // enable the scrollbar
        //         },
        //         rangeSelector: {
        //             enabled: true // enable the range selector
        //         }
        //     });
        // });
    }, []);

    return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'} // use stockChart constructor
            options={chartOptions}
        />
    );
};

export default MyChart;