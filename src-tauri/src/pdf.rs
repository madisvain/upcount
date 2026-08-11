use base64::Engine;
use serde::{Deserialize, Serialize};
use typst_library::foundations::{Dict, IntoValue, Str};
use typst_as_lib::TypstEngine;

static TEMPLATE: &str = include_str!("../templates/invoice.typ");

static FONT_REGULAR: &[u8] = include_bytes!("../../public/fonts/montserrat/Montserrat-Regular.ttf");
static FONT_MEDIUM: &[u8] = include_bytes!("../../public/fonts/montserrat/Montserrat-Medium.ttf");
static FONT_SEMIBOLD: &[u8] =
    include_bytes!("../../public/fonts/montserrat/Montserrat-SemiBold.ttf");
static FONT_BOLD: &[u8] = include_bytes!("../../public/fonts/montserrat/Montserrat-Bold.ttf");
static FONT_ITALIC: &[u8] = include_bytes!("../../public/fonts/montserrat/Montserrat-Italic.ttf");
static FONT_MEDIUM_ITALIC: &[u8] =
    include_bytes!("../../public/fonts/montserrat/Montserrat-MediumItalic.ttf");

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfInvoice {
    pub number: String,
    pub date: String,
    pub due_date: String,
    pub overdue_charge: Option<String>,
    pub customer_notes: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfClient {
    pub name: String,
    pub address: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfOrganization {
    pub name: String,
    pub address: Option<String>,
    pub email: Option<String>,
    pub website: Option<String>,
    pub bank_name: Option<String>,
    pub iban: Option<String>,
    pub registration_number: Option<String>,
    pub vatin: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfLineItem {
    pub description: String,
    pub quantity: String,
    pub unit_price: String,
    pub tax_pct: String,
    pub total: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfTaxGroup {
    pub name: String,
    pub amount: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfLabels {
    pub invoice: String,
    pub date: String,
    pub due_date: String,
    pub overdue_charge: String,
    pub description: String,
    pub qty: String,
    pub price: String,
    pub tax: String,
    pub total: String,
    pub subtotal: String,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PdfRequest {
    pub invoice: PdfInvoice,
    pub client: PdfClient,
    pub organization: PdfOrganization,
    pub line_items: Vec<PdfLineItem>,
    pub subtotal: String,
    pub tax_groups: Vec<PdfTaxGroup>,
    pub total: String,
    pub labels: PdfLabels,
    pub has_logo: bool,
}

fn decode_data_url(data_url: &str) -> Option<Vec<u8>> {
    let parts: Vec<&str> = data_url.splitn(2, ',').collect();
    if parts.len() != 2 {
        return None;
    }
    base64::engine::general_purpose::STANDARD
        .decode(parts[1])
        .ok()
}

pub fn generate_invoice_pdf(
    request: &PdfRequest,
    logo_data: Option<&str>,
) -> Result<Vec<u8>, String> {
    let json_data =
        serde_json::to_string(request).map_err(|e| format!("Failed to serialize data: {}", e))?;

    let logo_bytes = logo_data.and_then(decode_data_url);

    let mut builder = TypstEngine::builder()
        .main_file(TEMPLATE)
        .fonts([
            FONT_REGULAR,
            FONT_MEDIUM,
            FONT_SEMIBOLD,
            FONT_BOLD,
            FONT_ITALIC,
            FONT_MEDIUM_ITALIC,
        ]);

    if let Some(ref bytes) = logo_bytes {
        builder = builder.with_static_file_resolver([("logo.png", bytes.as_slice())]);
    }

    let engine = builder.build();

    let mut input = Dict::new();
    input.insert(Str::from("data"), json_data.into_value());

    let doc = engine
        .compile_with_input(input)
        .output
        .map_err(|e| format!("Typst compilation error: {:?}", e))?;

    let options = Default::default();
    typst_pdf::pdf(&doc, &options).map_err(|e| format!("PDF generation error: {:?}", e))
}
