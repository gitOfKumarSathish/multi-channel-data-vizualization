import React, { useEffect, useState } from 'react';
import * as API from './API/API';
import { Chart } from 'highcharts';
import Channel2 from './Channel2';
import Annotation from './Annotation';
import Volumn from './Volumn';
import LoadMoreBackupTypeFour from './loadMoreBackupTypeFour';
import LoadMoreBackupTypeOne from './loadMoreBackupTypeOne';
import LoadMoreBackupTypeThree from './loadMoreBackupTypeThree';
import LoadMoreBackupTypetwo from './loadMoreBackupTypetwo';

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
                return <LoadMoreBackupTypeOne key={index} configs={viewConfig} />;
            }
            else if (data_type === "volume") {
                return <LoadMoreBackupTypetwo key={index} configs={viewConfig} />;
            } else if (data_type === "mixed") {
                return <LoadMoreBackupTypeThree key={index} configs={viewConfig} />;
            } else if (data_type === "annot") {
                return <LoadMoreBackupTypeFour key={index} configs={viewConfig} />;
            }
        });
    };


    return (
        <>

            {chartChannel()}

        </>
    );
}
