### Changed

- **Accordion opens and closes more calmly.** The panel, chevron and content now move together in 240ms with a plain ease-out: no spring on the chevron, no delayed slide on the content (it only fades), and the same timing both ways. Under `prefers-reduced-motion` the panel shows and hides at once.
