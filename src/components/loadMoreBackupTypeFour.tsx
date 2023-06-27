import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import xrange from "highcharts/modules/xrange";
import HighchartsBoost from 'highcharts/modules/boost';
import { limit } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module
xrange(Highcharts);
HighchartsBoost(Highcharts);

const initialOptions = {
    chart: {
        type: "xrange",
        // animation: Highcharts.svg, // don't animate in old IE
        marginRight: 10,
        zoomType: "xy",
        panning: true,
        panKey: 'shift'
    },
    title: {
        text: "loadMoreBackupTypeFour",
    },
    xAxis: {
        // type: "datetime",
        tickPixelInterval: 100,
        labels: {
            formatter: function () {
                // Convert the timestamp to a date string
                return this.value;
            }
        }
    },
    yAxis: {
        opposite: false,
        title: {
            text: "Tags",
        },
        categories: ['abnormal', 'normal'],
    },
    tooltip: {
        formatter(this: any): string {
            return `<b>${this.x.toFixed(2) + ' - ' + this.x2.toFixed(2)}</b><br/><b>${this.yCategory}</b>`;
        },
    },
    legend: {
        enabled: false,
    },
    exporting: {
        enabled: true,
    },
    series: [
        {
            name: "Random data",
            data: [],
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
        enabled: true, // enable the navigator
        xAxis: {
            min: 0, // set the minimum value to the start of the current month
            max: 10000 // set the maximum value to the end of the third month from now
        }
    },
    scrollbar: {
        enabled: true // enable the scrollbar
    },
    rangeSelector: {
        enabled: false // enable the range selector
    },
};

const loadMoreBackupTypeFour = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [options, setOptions] = useState<any>(initialOptions);

    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);

    const fetchData = async () => {
        const newStart = start + limit;
        const response = await API.Annotpanning(start, newStart);
        setStart(newStart);

        response.data?.map((singleChannelData: {
            bt: any;
            tt: any;
            tag(tag: any): unknown; data: any;
        }) => {
            const chartData = {
                x: singleChannelData.bt,
                x2: singleChannelData.tt,
                y: singleChannelData?.tag === 'normal' ? 1 : 0,
                title: singleChannelData.tag,
            };
            setData((prevData: any) => [...prevData, chartData]);
        });


    };


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
            chart.update({
                series: [
                    {
                        data: data,
                    },
                ],
            });
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };





    return (
        // <div style={{ width: 1000 }}>
        <div>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
                constructorType={'stockChart'} // use stockChart constructor
            />
            <button onClick={handlePan}>Load More</button>
        </div>
    );
};

export default memo(loadMoreBackupTypeFour);