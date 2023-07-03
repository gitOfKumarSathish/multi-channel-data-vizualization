import React, { createContext, useEffect, useRef, useState } from 'react';
import * as API from './API/API';
import DataTypeTwo from './DataTypeTwo';
import DataTypeFour from './DataTypeFour';

export const ZoomContext = createContext(null);

export default function Charts() {
    const [viewConfigs, setViewConfigs] = useState([]);
    const [zoomLevel, setZoomLevel] = useState(1);
    const chartRefs = useRef([]);
    const elementsRef = useRef(viewConfigs?.map(() => React.createRef()));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const response = await API.viewConfig();
        setViewConfigs(response.data);
    };

    console.log('beofre', elementsRef);
    const chartChannel = () => {
        return viewConfigs.map((viewConfig, index) => {
            const { data_type } = viewConfig;
            if (data_type === "volume") {
                return (
                    <DataTypeTwo
                        key={index}
                        configs={viewConfig}
                        onZoomChange={handleZoomChange}
                        ref={elementsRef.current[index]}
                    />
                );
            } else if (data_type === "annot") {
                return (
                    <DataTypeFour
                        key={index}
                        configs={viewConfig}
                        onZoomChange={handleZoomChange}
                        ref={elementsRef.current[index]}
                    />
                );
            }
        });
    };

    const handleZoomChange = (newZoomLevel) => {
        setZoomLevel(newZoomLevel);
    };

    useEffect(() => {
        // Initialize chartRefs with the same length as viewConfigs
        // chartRefs.current = viewConfigs.map(() => React.createRef());
        // console.log('React.createRef()', React.createRef());
        // console.log('chartRefs.current', chartRefs.current);

        const elementsRef = useRef(viewConfigs.map(() => React.createRef()));
        console.log('elementsRef', elementsRef);
    }, [viewConfigs]);

    return (
        <>
            <ZoomContext.Provider value={zoomLevel}>
                {chartChannel()}
            </ZoomContext.Provider>
        </>
    );
}
