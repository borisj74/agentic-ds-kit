### Fixed

- **BarChart keeps whole-number ticks for whole-number data.** When every value is an integer (counts of runs, events, people), the value axis steps by at least 1, so it reads 0, 1, 2 instead of 0, 0.5, 1, 1.5, 2. Charts with fractional values are unchanged.
