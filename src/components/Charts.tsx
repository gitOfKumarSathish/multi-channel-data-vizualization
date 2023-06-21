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

    // const chartChannel = () => {
    //     return viewConfigs.map((viewConfig: { src_channels?: any; chart_type?: any; x_label?: any; y_label?: any; chart?: any; }, index: number) => {
    //         const { chart_type } = viewConfig;

    //         switch (chart_type) {
    //             case 'line':
    //             case 'bar':
    //             case 'column':
    //                 return <Channel2 key={index} configs={viewConfig} />;
    //             case 'xrange':
    //                 return <Annotation key={index} configs={viewConfig} />;
    //             default:
    //                 break;
    //         }
    //     });
    // };

    const chartChannel = () => {
        return viewConfigs.map((viewConfig: { src_channels?: any; chart_type?: any; x_label?: any; y_label?: any; chart?: any; }, index: number) => {
            const { chart_type } = viewConfig;

            if (['line', 'bar', 'column'].includes(chart_type)) {
                return <Channel2 key={index} configs={viewConfig} />;
            } else if (chart_type === 'xrange') {
                return <Annotation key={index} configs={viewConfig} />;
            } else {
                return null; // or handle the default case accordingly
            }
        });
    };


    return (
        <>

            {chartChannel()}

        </>
    );
}
