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

export type { IProps, IViewProps };
