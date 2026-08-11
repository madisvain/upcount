// ── Sample data (will be replaced by JSON input in integration phase) ────────
#let quotation = (
  number: "QUO-2026-018",
  date: "06.05.2026",
  valid_until: "06.06.2026",
  customer_notes: "This quotation is valid for 30 days from the date of issue. Prices are subject to change after the validity period.",
)

#let client = (
  name: "Acme Corporation",
  address: "123 Business Street\nTallinn 10115\nEstonia",
  email: "billing@acme.ee",
  website: "www.acme.ee",
)

#let org = (
  name: "Upcount OÜ",
  address: "Pärnu mnt 15\nTallinn 10141\nEstonia",
  email: "hello@upcount.ee",
  website: "www.upcount.ee",
  bank_name: "SEB",
  iban: "EE901010220123456789",
  registration_number: "16123456",
  vatin: "EE102345678",
)

#let line_items = (
  (description: "Website design and development", quantity: "1", unit_price: "€4,500.00", tax_pct: "22%", total: "€4,500.00"),
  (description: "Hosting setup and configuration for production and staging environments", quantity: "2", unit_price: "€150.00", tax_pct: "22%", total: "€300.00"),
  (description: "SEO audit and optimization", quantity: "1", unit_price: "€800.00", tax_pct: "22%", total: "€800.00"),
  (description: "Consulting", quantity: "3", unit_price: "€120.00", tax_pct: "0%", total: "€360.00"),
)

#let subtotal = "€5,960.00"
#let tax_groups = (
  (name: "VAT 22%", amount: "€1,232.00"),
  (name: "Tax 0%", amount: "€0.00"),
)
#let total = "€7,192.00"

#let labels = (
  quotation: "Quotation",
  date: "Date",
  valid_until: "Valid until",
  description: "Description",
  qty: "Qty.",
  price: "Price",
  tax: "Tax %",
  total: "Total",
  subtotal: "Subtotal",
)

// ── Page setup ──────────────────────────────────────────────────────────────
#set page(paper: "a4", margin: 50pt)
#set text(font: "Montserrat", size: 10pt)

// ── Header: Quotation title + logo ─────────────────────────────────────────
#grid(
  columns: (1fr, 1fr),
  align(left + horizon)[
    #text(size: 24pt, weight: "semibold")[#labels.quotation #quotation.number]
  ],
  align(right + horizon)[],
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

// ── Metadata: Date, Valid until ─────────────────────────────────────────────
#grid(
  columns: (20%, auto),
  row-gutter: 8pt,
  text(size: 8pt)[#labels.date],
  text(size: 8pt)[#quotation.date],
  text(size: 8pt)[#labels.valid_until],
  text(size: 8pt)[#quotation.valid_until],
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
    pad(y: 4pt)[#text(size: 8pt)[#item.unit_price]],
    pad(y: 4pt)[#text(size: 8pt)[#item.tax_pct]],
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
    #if quotation.customer_notes != none {
      text(size: 9pt, style: "italic")[#quotation.customer_notes]
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
      text(size: 10pt)[#org.bank_name #org.iban],
      align(center)[#text(size: 10pt)[Reg. nr #org.registration_number]],
      align(right)[#text(size: 10pt)[VATIN #org.vatin]],
    )
  ],
)
