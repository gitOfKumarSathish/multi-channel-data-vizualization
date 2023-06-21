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
        return viewConfigs.map((viewConfig, index: number) => {
            // const { channel } = viewConfig?.src_channels[0];

            const { chart_type } = viewConfig;
            // const { chart_type } = viewConfig?.src_channels;

            // viewConfig?.src_channels.map(x => {
            //     console.log('x', x);
            // });
            console.log('viewConfig?.src_channels', viewConfig?.src_channels);
            console.log('chart_type', chart_type);

            switch (chart_type) {
                case ('line' || 'bar'):
                    return <Channel2 key={index} configs={viewConfig} />;
                case ('xrange'):
                    return <Annotation key={index} configs={viewConfig} />;
                default:
                    break;
            }
            // switch (channel) {
            //     case 'volume':
            //         return <Channel2 key={index} configs={viewConfig?.src_channels[0]} />;
            //     case "annotation":
            //         // return <Annotation key={index} channel={channel} chartType={chart_type} x_label={x_label} y_label={y_label} />;
            //         return <Annotation key={index} configs={viewConfig?.src_channels[0]} />;
            //     default:
            //         break;
            // }
        });
    };


    return (
        <>

            {chartChannel()}

        </>
    );
}
