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
    configs: IViewProps & { chart_title?: string; plotValue?: string; };
    userConfig: any;
}

interface ISample {
    value: number;
    time: string;
}

interface IChannelData {
    channel: string;
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
    trigger: string;
    min: number;
    max: number;
}

interface IDataElement {
    ts: number;
    value: number;
}

interface IDataElementTypeThree {
    ts: number;
    values: {
        mean: string;
        std: string;
    };
}

interface IChartDataTypeFour {
    tag(tag?: string): string;
    bt?: any;
    tt?: any;
    x: number;
    x2: number;
    y: number;
    title: string;
}

interface ISingleChannelData {
    tag: string;
    bt: number;
    tt: number;
}

interface IChannelDataTypeFour {
    channel: string;
    data: IChartDataTypeFour[];
}

interface IChartData {
    ts?: number;
    channel: string;
    data: IDataElementTypeThree[];
}


export type { IProps, IViewProps, ISample, IChannelData, IChannelMappingResponse, ISrcChannel, IZoomRange, IDataElement, IDataElementTypeThree, IChartData, IChartDataTypeFour, IChannelDataTypeFour, ISingleChannelData };
