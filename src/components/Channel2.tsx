import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { memo, useEffect, useRef, useState } from "react";
import * as API from './API/API';
import { dataMappingForBasicChart } from "./Config";

// Initialize HighchartsMore module
HighchartsMore(Highcharts);

const Channel2 = (props: any) => {
    const { chart_type, x_label, y_label, chart, src_channels } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);

    const options = {
        chart: {
            // type: "line",
            type: String(chart_type),
            // type: "column",
            // type: 'bar',
            zoomType: "xy",
            panKey: 'shift',
            panning: true,
        },
        title: {
            text: String(chart)
        },
        xAxis: {
            categories: [],
            title: {
                text: String(x_label)
            },
        },
        yAxis: {
            type: "logarithmic",
            title: {
                text: String(y_label)
            },
            reversed: false
        },
        credits: {
            enabled: false
        },
        tooltip: {
            shared: true,
            crosshair: true,
        },
        series: src_channels.map((x: any) => [{ data: [] }])
    };


    const fetchData = async () => {
        const promises = src_channels.map((eachChannel: { channel: string; }) =>
            API.getData(eachChannel.channel)
        );

        try {
            const responses = await Promise.all(promises);
            const newData = responses.reduce((acc: any[], response: any) => {
                acc.push(...response.data);
                return acc;
            }, []);

            setData((prev: any) => [...newData, ...prev]);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        // console.log('data', data);
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataMappingForBasicChart(data, chart);
        }
    }, [data]);



    useEffect(() => {
        fetchData();
    }, []);

    return (
        // <div style={{ width: 1000 }}>
        <div>
            <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
        </div>

    );
};

export default memo(Channel2);


