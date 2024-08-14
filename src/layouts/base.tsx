import { Suspense } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Divider, Layout, Menu, Select, Space, Row, Col, message, theme } from "antd";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  BankOutlined,
  FileOutlined,
  CalculatorOutlined,
  PlusOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { pathToRegexp } from "path-to-regexp";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import join from "lodash/join";
import get from "lodash/get";
import map from "lodash/map";
import take from "lodash/take";
import toUpper from "lodash/toUpper";

import { organizationsAtom, organizationIdAtom, organizationAtom, siderAtom, localeAtom } from "src/atoms";
import { dynamicActivate, locales } from "src/utils/lingui";

const { Content, Header, Sider } = Layout;
const { Option } = Select;

export default function BaseLayout() {
  const { i18n } = useLingui();
  const location = useLocation();
  const navigate = useNavigate();

  const [, contextHolder] = message.useMessage();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Organizations
  const organizations = useAtomValue(organizationsAtom);

  // Organization
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const organization = useAtomValue(organizationAtom);

  // Locale
  const setLocale = useSetAtom(localeAtom);

  // Sider
  const [siderCollapsed, setSiderCollapsed] = useAtom(siderAtom);

  // Active menu item detection
  let openKeys: string[] = [];
  let selectedKeys: string[] = [];
  const match = pathToRegexp(`/(.*)`).exec(location.pathname);
  if (match) {
    const pathArray = get(match, 1).split("/");
    openKeys = pathArray[0] === "settings" ? ["settings"] : [];
    selectedKeys = [join(take(compact(pathArray), 2), ".")];
  }

  return (
    organization && (
      <Layout hasSider style={{ minHeight: "100vh", width: "100%" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={siderCollapsed}
          style={{ overflow: "auto", height: "100vh", position: "fixed", left: 0, top: 0, bottom: 0 }}
        >
          <div className="logo" style={{ height: 22, margin: "21px 16px", textAlign: "center" }}>
            <Link to="/invoices">
              <img src={siderCollapsed ? "/logo-minimal.svg" : "/logo-light.svg"} alt="Upcount" />
            </Link>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultOpenKeys={openKeys}
            defaultSelectedKeys={selectedKeys}
            items={[
              {
                icon: <FileTextOutlined />,
                label: (
                  <Link to="/invoices">
                    <Trans>Invoices</Trans>
                  </Link>
                ),
                key: "invoices",
              },
              {
                icon: <TeamOutlined />,
                label: (
                  <Link to="/clients">
                    <Trans>Clients</Trans>
                  </Link>
                ),
                key: "clients",
              },
              {
                icon: <FieldTimeOutlined />,
                label: (
                  <Link to="/time-tracking">
                    <Trans>Time tracking</Trans>
                  </Link>
                ),
                key: "time-tracking",
              },
              {
                icon: <SettingOutlined />,
                label: <Trans>Settings</Trans>,
                key: "settings",
                children: [
                  {
                    icon: <BankOutlined />,
                    label: (
                      <Link to="/settings/organization">
                        <Trans>Organization</Trans>
                      </Link>
                    ),
                    key: "settings.organization",
                  },
                  {
                    icon: <FileOutlined />,
                    label: (
                      <Link to="/settings/invoice">
                        <Trans>Invoice</Trans>
                      </Link>
                    ),
                    key: "settings.invoice",
                  },
                  {
                    icon: <CalculatorOutlined />,
                    label: (
                      <Link to="/settings/tax-rates">
                        <Trans>Tax rates</Trans>
                      </Link>
                    ),
                    key: "settings.tax-rates",
                  },
                ],
              },
            ]}
          />
        </Sider>
        <Layout style={{ width: "100%", marginLeft: siderCollapsed ? 80 : 200, transition: "all 0.2s" }}>
          <Header style={{ position: "sticky", top: 0, zIndex: 1, padding: 0, background: colorBgContainer }}>
            <Row>
              <Col flex="auto">
                <Button
                  type="text"
                  icon={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setSiderCollapsed(!siderCollapsed)}
                  style={{
                    fontSize: "16px",
                    width: 64,
                    height: 64,
                  }}
                />
              </Col>
              <Col>
                <Space>
                  {!isEmpty(organizations) && (
                    <Select
                      showSearch={organizations.length > 5 ? true : false}
                      style={{ width: 200 }}
                      defaultValue={organization.id}
                      onSelect={(value) => {
                        setOrganizationId(value);
                        navigate("/");
                      }}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Button
                            type="text"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => {}}
                            style={{ textAlign: "left" }}
                          >
                            <Trans>New organization</Trans>
                          </Button>
                        </>
                      )}
                    >
                      {map(organizations, (organization: any) => (
                        <Option key={organization.id} value={organization.id}>
                          {organization.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                  <Select
                    variant="borderless"
                    style={{ width: 60, marginRight: 24 }}
                    onSelect={(value) => {
                      setLocale(value);
                      dynamicActivate(value);
                    }}
                    value={i18n.locale}
                  >
                    {map(locales, (locale) => (
                      <Option value={locale} key={locale}>
                        {toUpper(locale)}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
            </Row>
          </Header>
          <Suspense fallback="loading">
            <Content
              style={{
                margin: "24px 16px",
                padding: 24,
                minHeight: 280,
                background: colorBgContainer,
                borderRadius: borderRadiusLG,
              }}
            >
              <Outlet />
              {/*<SignOut />*/}
            </Content>
          </Suspense>
          <div id="footer" />
        </Layout>
        {contextHolder}
      </Layout>
    )
  );
}
