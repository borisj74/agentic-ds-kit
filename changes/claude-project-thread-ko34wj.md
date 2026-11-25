### Fixed

- **A chart directly in a Card no longer draws a second border.** LineChart, BarChart, ComboChart, PieChart, ScatterChart and Heatmap drop their own frame (border, radius, fill) when they sit directly in a Card body, padded or flush, the way DataTable does in a flush Card. In a flush Card the chart takes the card's inline padding, so its title lines up with the card header. Before, a chart with a title, legend, actions or the Table toggle drew its frame inside the card.
