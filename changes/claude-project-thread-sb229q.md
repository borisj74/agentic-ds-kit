### Changed

- **Meters and bars share one corner radius.** Progress bars, TraceWaterfall bars (full and compact), ContextWindow and AgentFleet bars now use `--radius-control-sm` on the track and the fill, the same subtle corners Meter already had. Progress and TraceWaterfall bars were square; ContextWindow and AgentFleet were pills. UsageMeter, Scorecard meter bars and Cell/DataTable progress cells pick this up through Meter and Progress. 4px-tall bars (size sm, compact trace) come out fully round, because the radius is half their height.
