interface IViewProps {
    chart_title: string;
    chart_type: string;
    x_label: string;
    y_label: string;
    miniMap: boolean;
    data_limit: number;
    src_channels: ISrcChannel[];
    data_type: string;
}

interface IProps {
    onZoomChange(min: number, max: number): unknown;
    configs: IViewProps & { chart_title?: any; };
}

interface ISample {
    value: number;
    time: string;
}

interface IChannelData {
    channel: any;
    data: number[];
    sr: number;
    ts: number;
}

interface IChannelMappingResponse {
    channel: string;
    data: IChannelData;
}

interface ISrcChannel {
    channel: string;
    name: string;
}

interface IZoomRange {
    min: number;
    max: number;
}

interface IDataElement {
    ts: string;
    value: number;
}

interface IDataElementTypeThree {
    ts: number;
    values: {
        mean: string;
        std: string;
    };
}

interface IChartData {
    ts?: any;
    channel: string;
    data: IDataElementTypeThree[];
}


export type { IProps, IViewProps, ISample, IChannelData, IChannelMappingResponse, ISrcChannel, IZoomRange, IDataElement, IDataElementTypeThree, IChartData };
