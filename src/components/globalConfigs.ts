const epochConverted = (time: number) => {
    const epochTime = time;
    const date = new Date(epochTime);
    const localISOTimeString = date.toLocaleString();
    return (localISOTimeString.split(',')[1]).trim();
};

function defaultZoomBehavior(this: any) {
    const chart = this;
    const resetZoomButton = chart?.renderer.button(
        'Reset Zoom',
        null,
        null,
        function () {
            chart.xAxis[0].setExtremes(null, null);
            chart.yAxis[0].setExtremes(null, null);
        }
    )
        .attr({
            // align: 'right',
            'vertical-align': 'top',
            y: 65,
            x: 0,
            zIndex: 9999
        })
        .addClass('reset-zoom-button')
        .add();

    // Position the button dynamically if the chart width changes
    chart.updateResetZoomButtonPosition = function () {
        resetZoomButton.attr({
            x: chart.chartWidth - resetZoomButton.width - 10
        });
    };

    // Update the button position initially and on chart resize
    chart.updateResetZoomButtonPosition();
    window.addEventListener('resize', chart.updateResetZoomButtonPosition);
}

export {
    epochConverted,
    defaultZoomBehavior
};