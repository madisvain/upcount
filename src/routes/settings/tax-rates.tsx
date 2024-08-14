import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button, Col, Space, Table, Typography, Row } from "antd";
import { useAtomValue, useSetAtom } from "jotai";
import { CalculatorOutlined, CheckSquareOutlined } from "@ant-design/icons";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

import { taxRatesAtom, setTaxRatesAtom } from "src/atoms";

const { Title } = Typography;

function SettingsTaxRates() {
  useLingui();
  const location = useLocation();

  const taxRates = useAtomValue(taxRatesAtom);
  const setTaxRates = useSetAtom(setTaxRatesAtom);

  useEffect(() => {
    if (location.pathname === "/settings/tax-rates") {
      setTaxRates();
    }
  }, [location]);

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ marginTop: 0 }}>
            <Space>
              <CalculatorOutlined />
              <Trans>Tax rates</Trans>
            </Space>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link to="/settings/tax-rates/new">
            <Button type="primary" style={{ marginBottom: 10 }}>
              <Trans>New tax</Trans>
            </Button>
          </Link>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table dataSource={taxRates} pagination={false} rowKey="id" size="middle" bordered style={{ width: "100%" }}>
            <Table.Column
              title={<Trans>Name</Trans>}
              key="name"
              render={(taxRate) => <Link to={`/settings/tax-rates/${taxRate.id}`}>{taxRate.name}</Link>}
            />
            <Table.Column title={<Trans>Description</Trans>} dataIndex="description" key="description" />
            <Table.Column
              title={
                <div style={{ textAlign: "right" }}>
                  <Trans>Percentage</Trans>
                </div>
              }
              align="right"
              dataIndex="percentage"
              key="percentage"
              render={(percentage) => `${percentage} %`}
            />
            <Table.Column
              title={
                <div style={{ textAlign: "center" }}>
                  <Trans>Default</Trans>
                </div>
              }
              align="center"
              dataIndex="isDefault"
              key="isDefault"
              render={(value) => {
                return value ? <CheckSquareOutlined /> : "-";
              }}
            />
          </Table>
        </Col>
      </Row>
      <Outlet />
    </>
  );
}

export default SettingsTaxRates;
