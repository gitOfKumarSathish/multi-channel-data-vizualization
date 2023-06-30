import React, { useEffect, useState } from 'react';
import * as API from './API/API';
import DataTypeOne from './DataTypeOne';
import DataTypeTwo from './DataTypeTwo';
import DataTypeThree from './DataTypeThree';
import DataTypeFour from './DataTypeFour';

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
        return viewConfigs.map((viewConfig: { src_channels?: any; data_type?: any; chart_type?: any; x_label?: any; y_label?: any; chart?: any; }, index: number) => {
            console.log('viewConfig', viewConfig);
            const { data_type } = viewConfig;
            if (data_type === "wf") {
                return <DataTypeOne key={index} configs={viewConfig} />;
            } else if (data_type === "volume") {
                return <DataTypeTwo key={index} configs={viewConfig} />;
            } else if (data_type === "mixed") {
                return <DataTypeThree key={index} configs={viewConfig} />;
            } else if (data_type === "annot") {
                return <DataTypeFour key={index} configs={viewConfig} />;
            }
        });
    };


    return (
        <>

            {chartChannel()}

        </>
    );
}
