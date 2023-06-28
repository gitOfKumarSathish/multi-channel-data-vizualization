import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { memo, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import { limitForMixed } from './Config';
import HighchartsStock from 'highcharts/modules/stock'; // import the Highcharts Stock module

HighchartsStock(Highcharts); // initialize the Stock module

const loadMoreBackupTypeThree = () => {
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [xAxisCategory, setXAxisCategory] = useState<any[]>([]);
    const [start, setStart] = useState(0);
    const [data, setData] = useState<any[]>([]);
    const [overAllData, setOverAllData] = useState<any[]>([]);

    const fetchData = async () => {
        const newStart = start + limitForMixed;
        const response = await API.mixed(start, newStart);
        setStart(newStart);

        const newData: any[] = [];
        const newXAxisCategory: any[] = [];
        setOverAllData((prevData) => [...prevData, ...response.data]);
        response.data.forEach(({ values, ts }: any) => {
            const mean = values?.mean;
            const xTimeStamp = ts.toFixed(2);

            if (mean) {
                newData.push(mean);
                newXAxisCategory.push(xTimeStamp);
            }
        });
        setData((prevData) => [...prevData, ...newData]);
        setXAxisCategory((prevData) => [...prevData, ...newXAxisCategory]);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart) {
            chart.update({ series: [{ data }] }, false);
            chart.xAxis[0].setCategories(xAxisCategory, false);
            chart.redraw();
        }
    }, [data]);

    const handlePan = () => {
        fetchData();
    };

    const options = {
        chart: {
            type: "line",
            marginRight: 10,
            zoomType: "xy",
            panning: true,
            panKey: 'shift'
        },
        title: {
            text: "loadMoreBackupTypeThree",
        },
        xAxis: {
            categories: xAxisCategory,
            tickPixelInterval: 1,
            ordinal: false,
        },
        yAxis: {
            opposite: false,
            title: {
                text: "Value",
            },
            ordinal: false,
        },
        tooltip: {

            formatter(this: any): string {
                const xValue = this.x;
                const yValue = this.y;

                // Find the corresponding data point in the overall data
                const correspondingData = overAllData.find((data: any) => {
                    return data.ts.toFixed(2) === xValue.toString();
                });
                console.log('correspondingData', correspondingData);
                // Generate the tooltip content using the corresponding data
                let tooltipContent: string = '';
                // let tooltipContent = `<b>${xValue}</b><br/><b>${yValue}</b>`;
                if (correspondingData) {
                    tooltipContent += `<br/><b>mean: ${correspondingData.values.mean}</b>`;
                    tooltipContent += `<br/><b>std: ${correspondingData.values.std}</b>`;
                    tooltipContent += `<br/><b>ts: ${correspondingData.ts}</b>`;
                }

                return tooltipContent;
            },
            // shared: true
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
                data: data,
            },
        ],
        navigator: {
            enabled: true,
            adaptToUpdatedData: true,
            xAxis: {
                labels: {
                    formatter(this: any): string {
                        const xValue = this.value;
                        const correspondingData = overAllData[xValue];
                        // Format the label based on the x-axis value
                        return correspondingData?.ts;
                    },
                },
            }
        },
        scrollbar: {
            enabled: true,
        },
        rangeSelector: {
            enabled: false,
        },
        credits: {
            enabled: false
        },
    };

    return (
        <div style={{ width: 1000 }}>
            <HighchartsReact
                highcharts={Highcharts}
                ref={chartRef}
                options={options}
                constructorType={'stockChart'}
            />
            <button onClick={handlePan}>Load More</button>
        </div>
    );
};

export default memo(loadMoreBackupTypeThree);
