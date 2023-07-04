interface IProps {
    onZoomChange(min: any, max: any): unknown;
    configs: {
        chart_title: any;
        chart_type: any;
        x_label: any;
        y_label: any;
        miniMap: any;
        data_limit: any;
        src_channels: any;
    };
}


export type {
    IProps
};