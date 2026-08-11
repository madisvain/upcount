// ── Data input from sys.inputs ──────────────────────────────────────────────
#let data = json.decode(sys.inputs.at("data"))
#let invoice = data.invoice
#let client = data.client
#let org = data.organization
#let line_items = data.lineItems
#let subtotal = data.subtotal
#let tax_groups = data.taxGroups
#let total = data.total
#let labels = data.labels
#let has-logo = data.hasLogo

// ── Page setup ──────────────────────────────────────────────────────────────
#set page(paper: "a4", margin: 50pt)
#set text(font: "Montserrat", size: 10pt)

// ── Header: Invoice title + logo ────────────────────────────────────────────
#grid(
  columns: (1fr, 1fr),
  align(left + horizon)[
    #text(size: 24pt, weight: "semibold")[#labels.invoice #invoice.number]
  ],
  align(right + horizon)[
    #if has-logo {
      image("logo.png", width: 120pt)
    }
  ],
)

#v(36pt)

// ── Client and Organization details ─────────────────────────────────────────
#grid(
  columns: (1fr, 1fr),
  [
    #text(size: 12pt)[#client.name]
    #v(8pt)
    #set text(size: 8pt)
    #set par(spacing: 0.65em)
    #client.address
    #v(4pt)
    #client.email \
    #client.website
  ],
  align(right)[
    #text(size: 12pt)[#org.name]
    #v(8pt)
    #set text(size: 8pt)
    #set par(spacing: 0.65em)
    #org.address
    #v(4pt)
    #org.email \
    #org.website
  ],
)

#v(36pt)

// ── Metadata: Date, Due date, Overdue charge ────────────────────────────────
#grid(
  columns: (20%, auto),
  row-gutter: 8pt,
  text(size: 8pt)[#labels.date],
  text(size: 8pt)[#invoice.date],
  text(size: 8pt)[#labels.dueDate],
  text(size: 8pt)[#invoice.dueDate],
  ..if invoice.overdueCharge != none {
    (
      text(size: 8pt)[#labels.overdueCharge],
      text(size: 8pt)[#invoice.overdueCharge],
    )
  } else {
    ()
  },
)

#v(36pt)

// ── Line items table ────────────────────────────────────────────────────────
#let border-color = rgb("868686")
#let col-widths = (4%, 56%, 10%, 10%, 10%, 10%)
#let item-count = line_items.len()

// Header row
#grid(
  columns: col-widths,
  column-gutter: 0pt,
  ..{
    let headers = (
      [\#],
      [#labels.description],
      [#labels.qty],
      [#labels.price],
      [#labels.tax],
      align(right)[#labels.total],
    )
    headers.map(h => pad(y: 2pt)[#text(size: 8pt, weight: "medium")[#h]])
  },
)
#line(length: 100%, stroke: 2pt + border-color)

// Data rows
#for (i, item) in line_items.enumerate() {
  grid(
    columns: col-widths,
    column-gutter: 0pt,
    pad(y: 4pt)[#text(size: 8pt)[#str(i + 1)]],
    pad(y: 4pt)[#text(size: 8pt)[#item.description]],
    pad(y: 4pt)[#text(size: 8pt)[#item.quantity]],
    pad(y: 4pt)[#text(size: 8pt)[#item.unitPrice]],
    pad(y: 4pt)[#text(size: 8pt)[#item.taxPct]],
    pad(y: 4pt)[#align(right)[#text(size: 8pt)[#item.total]]],
  )
  if i == item-count - 1 {
    line(length: 100%, stroke: 2pt + border-color)
  } else {
    line(length: 100%, stroke: 0.5pt + border-color)
  }
}

#v(4pt)

// ── Notes + Summary ─────────────────────────────────────────────────────────
#grid(
  columns: (60%, 40%),
  // Left: customer notes
  pad(right: 20pt, top: 4pt)[
    #if invoice.customerNotes != none {
      text(size: 9pt, style: "italic")[#invoice.customerNotes]
    }
  ],
  // Right: totals
  [
    // Subtotal
    #grid(
      columns: (1fr, auto),
      pad(y: 4pt)[#text(size: 8pt)[#labels.subtotal]],
      pad(y: 4pt)[#align(right)[#text(size: 8pt)[#subtotal]]],
    )
    // Tax groups
    #for group in tax_groups {
      grid(
        columns: (1fr, auto),
        pad(y: 4pt)[#text(size: 8pt)[#group.name]],
        pad(y: 4pt)[#align(right)[#text(size: 8pt)[#group.amount]]],
      )
    }
    // Total
    #v(8pt)
    #line(length: 100%, stroke: 2pt + border-color)
    #grid(
      columns: (1fr, auto),
      pad(top: 8pt, bottom: 4pt)[#text(size: 8pt, weight: "bold")[#labels.total]],
      pad(top: 8pt, bottom: 4pt)[#align(right)[#text(size: 8pt, weight: "bold")[#total]]],
    )
  ],
)

// ── Footer ──────────────────────────────────────────────────────────────────
#place(
  bottom + left,
  dx: 0pt,
  dy: 20pt,
  block(width: 100%)[
    #line(length: 100%, stroke: 0.5pt + border-color)
    #v(3pt)
    #grid(
      columns: (1fr, 1fr, 1fr),
      text(size: 10pt)[#org.bankName #org.iban],
      align(center)[#text(size: 10pt)[Reg. nr #org.registrationNumber]],
      align(right)[#text(size: 10pt)[VATIN #org.vatin]],
    )
  ],
)
