interface IViewProps {
    data_type: any;
    chart_type: any;
    x_label: any;
    y_label: any;
    miniMap: any;
    data_limit: any;
    src_channels: any;
}

interface IProps {
    onZoomChange(min: any, max: any): unknown;
    configs: IViewProps & { chart_title?: any; };
}

interface ISample {
    value: number;
    time: string;
}

interface IChannelData {
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

export type { IProps, IViewProps, ISample, IChannelData, IChannelMappingResponse, ISrcChannel };
