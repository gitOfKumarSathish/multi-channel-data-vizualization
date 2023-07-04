import React, { useEffect, useState } from 'react';
import * as API from './API/API';
import DataTypeTwo from './DataTypeTwo';
import DataTypeFour from './DataTypeFour';
import DataTypeThree from './DataTypeThree';
import DataTypeOne from './DataTypeOne';
import { IViewProps, IZoomRange } from './API/interfaces';


export const ZoomContext = React.createContext();
export default function Charts() {
    const [viewConfigs, setViewConfigs] = useState([]);
    const [zoomLevel, setZoomLevel] = useState<IZoomRange>();

    const handleZoomChange = (min: number, max: number) => {
        setZoomLevel({ min, max });
    };
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await API.viewConfig();
        setViewConfigs(response.data);
    };

    const chartChannel = () => {
        return viewConfigs.map((viewConfig: IViewProps, index: number) => {
            const { data_type } = viewConfig;
            if (data_type === "volume") {
                return <DataTypeTwo key={index} configs={viewConfig} onZoomChange={handleZoomChange} />;
            } else if (data_type === "annot") {
                return <DataTypeFour key={index} configs={viewConfig} onZoomChange={handleZoomChange} />;
            } else if (data_type === "wf") {
                return <DataTypeOne key={index} configs={viewConfig} onZoomChange={handleZoomChange} />;
            } else if (data_type === "mixed") {
                return <DataTypeThree key={index} configs={viewConfig} onZoomChange={handleZoomChange} />;
            }
        });
    };


    return (
        <ZoomContext.Provider value={zoomLevel}>
            {chartChannel()}
        </ZoomContext.Provider>
    );
}
