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
let Yaxis: any = [];
const loadMoreBackupTypeFour = (props: any) => {
    const { chart_title, chart_type, x_label, y_label, miniMap, data_limit } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);
    const [start, setStart] = useState(0);
    const [xAxisCategory, setXAxisCategory] = useState<any>([]);

    const fetchData = async () => {
        const newStart = start + data_limit;

        let uniqueArray: string | unknown[];
        const response = await API.annot(start, newStart);
        setStart(newStart);

        response.data?.map((singleChannelData: {
            bt: any;
            tt: any;
            tag(tag: any): unknown; data: any;
        }) => {

            Yaxis.push(singleChannelData.tag);
            uniqueArray = [...new Set(Yaxis)];
            console.log('uniqueArray', uniqueArray);
            setXAxisCategory(uniqueArray);
            const chartData = {
                x: singleChannelData.bt,
                x2: singleChannelData.tt,
                // y: singleChannelData?.tag === 'normal' ? 1 : 0,
                y: uniqueArray.indexOf(singleChannelData.tag),
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
                formatter(this: any): string {
                    // Convert the timestamp to a date string
                    return this.value;
                }
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
            formatter(this: any): string {
                return `<b>${this.x.toFixed(2) + ' - ' + this.x2.toFixed(2)}</b><br/><b>${this.yCategory}</b>`;
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
        series: [
            {
                name: "Random data",
                data: data,
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
            enabled: Boolean(miniMap), // enable the navigator
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

export default memo(loadMoreBackupTypeFour);