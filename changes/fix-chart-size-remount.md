### Fixed

- **Charts redraw after switching from Table back to Chart.** LineChart, BarChart, ComboChart and ScatterChart measured only the first plot node, so after the table round trip the plot stayed blank until the page reloaded. The size hook now measures the remounted plot.
