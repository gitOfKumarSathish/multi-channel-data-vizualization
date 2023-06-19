import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { memo, useEffect, useRef, useState } from "react";
import * as API from './API/API';
import { dataIntegration } from "./Config";

// Initialize HighchartsMore module
HighchartsMore(Highcharts);



const Channel2 = (props: { configs: { channel: any; chart_type: any; x_label: any; y_label: any; }; }) => {
    const { channel, chart_type, x_label, y_label } = props.configs;
    const chartRef = useRef<HighchartsReact.Props>(null);
    const [data, setData] = useState<any>([]);

    const options = {
        chart: {
            // type: "line",
            type: String(chart_type),
            // type: "bar",
            zoomType: "xy",
            panKey: 'shift',
            panning: true,
        },
        title: {
            text: String(channel)
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
        tooltip: {
            shared: true,
            crosshair: true,
        },
        series: [
            {
                data: []
            },
        ],
    };


    const fetchData = async () => {
        const response = await API.getVolumes();
        setData(response.data);
    };

    useEffect(() => {
        const chart = chartRef.current?.chart;
        if (chart && data) {
            dataIntegration(data, chart);
        }
    }, [data]);



    useEffect(() => {
        fetchData();
    }, []);

    return (
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    );
};

export default memo(Channel2);


