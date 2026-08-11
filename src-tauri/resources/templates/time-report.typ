#set page(margin: 50pt)
#set text(font: "Montserrat", size: 10pt)

#let data = json(sys.inputs.at("data"))

#text(size: 24pt, weight: "semibold")[Time Report]
#linebreak()
#v(4pt)
#text(size: 10pt)[#data.dateRange]
#if data.client != none {
  linebreak()
  text(size: 10pt)[#data.client]
}

#v(24pt)

#table(
  columns: (1fr, auto, auto),
  align: (left, center, right),
  stroke: none,
  inset: 8pt,
  table.header(
    text(weight: "medium")[Name],
    text(weight: "medium")[Entries],
    text(weight: "medium")[Total Time],
  ),
  table.hline(stroke: 2pt + black),
  ..for row in data.rows {
    (
      row.name,
      str(row.entries),
      row.formattedDuration,
    )
  },
  table.hline(stroke: 0.5pt + luma(134)),
)
