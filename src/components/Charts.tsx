import React, { useEffect, useState } from 'react';
import * as API from './API/API';
import DataTypeTwo from './DataTypeTwo';
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

    const chartChannel = () => {
        return viewConfigs.map((viewConfig: { src_channels?: any; data_type?: any; chart_type?: any; x_label?: any; y_label?: any; chart?: any; }, index: number) => {
            const { data_type } = viewConfig;
            if (data_type === "volume") {
                return <DataTypeTwo key={index} configs={viewConfig} />;
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
