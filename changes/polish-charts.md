### Changed

- **Charts are quieter.** BarChart and LineChart draw fewer, fainter gridlines and keep the zero line as the only full-strength guide. With `showGrid={false}` they show just a hairline baseline, with no value-axis rule. Axis labels use the caption weight.
- **Chart tooltips are smaller and line up.** BarChart, LineChart and PieChart tooltips have less padding, a smaller radius and a round key. Values align at the end of each row and long series names get an ellipsis. Tooltips sit on the raised surface, so they stand out from the card in dark mode.
- **Chart legends use the same spacing.** Swatch-to-label spacing is now the same in horizontal and vertical legends.
- **LineChart lines are a little thinner**, and the hover crosshair is a solid border-colour hairline.
- **LineChart areas fade toward the baseline.** The `area` variant fills each series with a vertical gradient of its own colour, about 20% at the top fading to nothing at the baseline, in place of the flat 15% fill.
- **PieChart no longer glows or blurs.** The active slice has no glow, and the other slices just fade.

### Fixed

- **PieChart fits narrow cards.** At 390px the donut used to run past the card edge. `size` is now the largest it gets: in a narrow container it shrinks and stays square, and its tooltip stays on the slice.
