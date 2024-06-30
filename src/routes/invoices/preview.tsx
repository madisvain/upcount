import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, Link } from "react-router-dom";
import { Page, Document, pdfjs } from "react-pdf";
import { useSetAtom, useAtomValue } from "jotai";
import { Button, Row, Col, Space, Layout, Popconfirm, theme } from "antd";
import { useResizeObserver } from "usehooks-ts";
import { DeleteOutlined, EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { pdf, BlobProvider, PDFViewer } from "@react-pdf/renderer";
import { save } from "@tauri-apps/api/dialog";
import { writeBinaryFile } from "@tauri-apps/api/fs";

import {
  invoiceIdAtom,
  invoiceAtom,
  clientIdAtom,
  clientAtom,
  organizationAtom,
  taxRatesAtom,
  setTaxRatesAtom,
} from "src/atoms";
import InvoicePDF from "src/components/invoices/pdf";

const { Footer } = Layout;

const PDF_DEBUG = false;

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

const InvoicePreview: React.FC = () => {
  const { id } = useParams<string>();
  const { i18n } = useLingui();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const setInvoiceId = useSetAtom(invoiceIdAtom);
  const invoice = useAtomValue(invoiceAtom);
  const setClientId = useSetAtom(clientIdAtom);
  const client = useAtomValue(clientAtom);
  const organization = useAtomValue(organizationAtom);
  const taxRates = useAtomValue(taxRatesAtom);
  const setTaxRates = useSetAtom(setTaxRatesAtom);

  const ref = useRef<HTMLDivElement>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const { width: wrapperWidth, height: wrapperHeight } = useResizeObserver({ ref, box: "border-box" });

  useEffect(() => {
    setInvoiceId(id || null);
    setTaxRates();

    // Clean up
    return () => {
      setInvoiceId(null);
    };
  }, []);
  useEffect(() => {
    if (invoice) setClientId(invoice.clientId);
  }, [invoice]);

  const handleDelete = (id: string) => async () => {
    console.log("Delete invoice", id);
    // TODO: Implement delete
    // messageApi.success(t`Invoice has been deleted`);
    // navigate("/invoices");
  };

  const fitHorizontal = useMemo(() => {
    if (!pageWidth || !pageHeight || !wrapperWidth || !wrapperHeight) {
      return false;
    }

    const wRatio = pageWidth / wrapperWidth;
    // const hRatio = pageHeight / wrapperHeight;
    if (wRatio < 0.99) {
      return true;
    }
    return false;
  }, [pageHeight, pageWidth, wrapperWidth, wrapperHeight]);

  return (
    <>
      <Row>
        <Col span={24}>
          <div ref={ref} style={{ width: "100%", height: "100%", overflow: "auto" }}>
            {!PDF_DEBUG && invoice && client && taxRates && (
              <BlobProvider
                document={
                  <InvoicePDF
                    invoice={invoice}
                    client={client}
                    organization={organization}
                    taxRates={taxRates}
                    i18n={i18n}
                  />
                }
              >
                {/* TODO: implement loading & error states {({ url, loading, error }) => { */}
                {({ url }) => {
                  return (
                    <Document file={url}>
                      <Page
                        pageNumber={1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onLoadSuccess={(page) => {
                          setPageWidth(page.width);
                          setPageHeight(page.height);
                        }}
                        width={fitHorizontal ? wrapperWidth : undefined}
                        height={!fitHorizontal ? wrapperHeight : undefined}
                      />
                    </Document>
                  );
                }}
              </BlobProvider>
            )}
            {PDF_DEBUG && invoice && client && taxRates && (
              <PDFViewer style={{ width: "100%", height: 800 }}>
                <InvoicePDF
                  invoice={invoice}
                  client={client}
                  organization={organization}
                  taxRates={taxRates}
                  i18n={i18n}
                />
              </PDFViewer>
            )}
          </div>
          {/* Footer menu */}
          {document.getElementById("footer") &&
            createPortal(
              <Footer
                style={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 1,
                  padding: 0,
                  background: colorBgContainer,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                <Row align="middle" justify="space-between" style={{ height: 64 }}>
                  <Col>
                    {id && (
                      <Popconfirm
                        title={t`Delete the invoice?`}
                        description={t`Are you sure to delete this invoice?`}
                        onConfirm={handleDelete(id)}
                        okText={t`Yes`}
                        cancelText={t`No`}
                      >
                        <Button type="dashed">
                          <DeleteOutlined /> <Trans>Delete</Trans>
                        </Button>
                      </Popconfirm>
                    )}
                  </Col>
                  <Col>
                    <Space>
                      {/*!isNew && invoice && (
                          <Dropdown overlay={stateMenu(invoice._id, invoice._rev)} trigger={["click"]}>
                            <StateTag state={invoice.state} style={{ marginTop: 10, marginRight: 20 }} />
                          </Dropdown>
                        )*/}
                      <Link to={`/invoices/${id}`}>
                        <Button type="dashed">
                          <EditOutlined /> Edit
                        </Button>
                      </Link>
                      <Button
                        onClick={async () => {
                          const blob = await pdf(
                            <InvoicePDF
                              invoice={invoice}
                              client={client}
                              organization={organization}
                              taxRates={taxRates}
                              i18n={i18n}
                            />
                          ).toBlob();
                          const filePath = await save({ defaultPath: `invoice-${id}.pdf` });
                          if (!filePath) return;

                          const contents = await blob.arrayBuffer();
                          await writeBinaryFile(filePath, contents);
                        }}
                      >
                        <FilePdfOutlined /> PDF
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Footer>,
              // @ts-expect-error - Footer can be null
              document.getElementById("footer")
            )}
        </Col>
      </Row>
    </>
  );
};

export default InvoicePreview;
