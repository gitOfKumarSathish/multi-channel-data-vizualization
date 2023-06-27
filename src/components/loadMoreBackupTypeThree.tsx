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

    const fetchData = async () => {
        const newStart = start + limitForMixed;
        const response = await API.mixed(start, newStart);
        setStart(newStart);

        const newData: any[] = [];
        const newXAxisCategory: any[] = [];

        response.data.forEach(({ values, ts }: any) => {
            const mean = values?.mean;
            console.log('mean', mean);
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
        },
        yAxis: {
            opposite: false,
            title: {
                text: "Value",
            },
        },
        tooltip: {
            formatter(this: any): string {
                return `<b>${this.x}</b><br/><b>${this.y}</b>`;
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
                data: data,
            },
        ],
        navigator: {
            enabled: true,
        },
        scrollbar: {
            enabled: true,
        },
        rangeSelector: {
            enabled: false,
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
