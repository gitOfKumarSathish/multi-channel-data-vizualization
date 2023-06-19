import React, { useEffect, useState } from 'react';
import * as API from './API/API';
import { Chart } from 'highcharts';
import Channel2 from './Channel2';
import Annotation from './Annotation';

export default function Charts() {
    const [viewConfigs, setViewConfigs] = useState<any>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await API.viewConfig();
        setViewConfigs(response.data);
    };

    const chartChannel = () => {
        return viewConfigs.map((viewConfig: { src_channels: { channel: any, chart_type: any, x_label: any, y_label: any; }[]; }, index: number) => {
            const { channel } = viewConfig?.src_channels[0];

            switch (channel) {
                case 'volume':
                    return <Channel2 key={index} configs={viewConfig?.src_channels[0]} />;
                case "annotation":
                    // return <Annotation key={index} channel={channel} chartType={chart_type} x_label={x_label} y_label={y_label} />;
                    return <Annotation key={index} configs={viewConfig?.src_channels[0]} />;
                default:
                    break;
            }
        });
    };


    return (
        <>

            <h1>as</h1>
            {chartChannel()}

        </>
    );
}
