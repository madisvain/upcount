import { Outlet, Link, useLocation, useNavigate } from "react-router";
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
  DatabaseOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";
import { match } from "path-to-regexp";
import compact from "lodash/compact";
import isEmpty from "lodash/isEmpty";
import join from "lodash/join";
import map from "lodash/map";
import take from "lodash/take";
import toUpper from "lodash/toUpper";

import { siderAtom, localeAtom } from "src/atoms/generic";
import { organizationsAtom, organizationIdAtom, organizationAtom } from "src/atoms/organization";
import Timer from "src/components/timer";
import { dynamicActivate, locales } from "src/utils/lingui";
import { useAutoUpdater } from "src/hooks/useAutoUpdater";

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
  const organizationId = useAtomValue(organizationIdAtom);
  const setOrganizationId = useSetAtom(organizationIdAtom);
  const organization = useAtomValue(organizationAtom);

  // Locale
  const setLocale = useSetAtom(localeAtom);

  // Sider
  const [siderCollapsed, setSiderCollapsed] = useAtom(siderAtom);

  // Auto-updater
  useAutoUpdater();

  // If no organizationId is set, redirect to index page
  if (!organizationId) {
    navigate("/");
    return null;
  }

  // If organizationId exists but organization is null (not found), clear the invalid ID and redirect
  if (organizationId && organization === null) {
    setOrganizationId(null);
    navigate("/");
    return null;
  }

  // Active menu item detection
  let openKeys: string[] = [];
  let selectedKeys: string[] = [];
  const matchFn = match(`/*path`, { decode: decodeURIComponent });
  const matchResult = matchFn(location.pathname);
  if (matchResult && matchResult.params.path) {
    const pathString = Array.isArray(matchResult.params.path)
      ? matchResult.params.path.join("/")
      : matchResult.params.path;
    const pathArray = pathString.split("/");
    openKeys = pathArray[0] === "settings" ? ["settings"] : [];
    selectedKeys = [join(take(compact(pathArray), 2), ".")];
  }

  if (!organization) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
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
                icon: <ProjectOutlined />,
                label: (
                  <Link to="/projects">
                    <Trans>Projects</Trans>
                  </Link>
                ),
                key: "projects",
              },
              {
                icon: <FieldTimeOutlined />,
                label: <Trans>Time tracking</Trans>,
                key: "time-tracking",
                children: [
                  {
                    icon: <ClockCircleOutlined />,
                    label: (
                      <Link to="/time-tracking">
                        <Trans>Timer</Trans>
                      </Link>
                    ),
                    key: "time-tracking.timer",
                  },
                  {
                    icon: <BarChartOutlined />,
                    label: (
                      <Link to="/time-tracking/reports">
                        <Trans>Reports</Trans>
                      </Link>
                    ),
                    key: "time-tracking.reports",
                  },
                ],
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
                  {
                    icon: <DatabaseOutlined />,
                    label: (
                      <Link to="/settings/backup">
                        <Trans>Backup</Trans>
                      </Link>
                    ),
                    key: "settings.backup",
                  },
                ],
              },
            ]}
          />
        </Sider>
        <Layout style={{ width: "100%", marginLeft: siderCollapsed ? 80 : 200, transition: "all 0.2s" }}>
          <Header
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              padding: 0,
              background: colorBgContainer,
              borderTop: "1px solid #f0f0f0",
            }}
          >
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
                  <Timer />
                  {!isEmpty(organizations) && (
                    <Select
                      showSearch={organizations.length > 5 ? true : false}
                      filterOption={(input, option) => {
                        if (!option) return false;
                        // Get the organization name from the option
                        const organizations = option as any;
                        const orgName = organizations?.children;
                        return orgName ? String(orgName).toLowerCase().includes(input.toLowerCase()) : false;
                      }}
                      style={{ width: 200 }}
                      defaultValue={organization.id}
                      onSelect={(value) => {
                        setOrganizationId(value);
                        window.location.reload();
                      }}
                      popupRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: "8px 0" }} />
                          <Button
                            type="text"
                            block
                            icon={<PlusOutlined />}
                            onClick={() => {
                              navigate("/organizations/new");
                            }}
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
                    style={{ marginRight: 24 }}
                    popupMatchSelectWidth={false}
                    onSelect={(value) => {
                      setLocale(value);
                      dynamicActivate(value);
                    }}
                    value={i18n.locale}
                    optionLabelProp="label"
                  >
                    {map(locales, (locale) => {
                      const languageMap: Record<string, string> = {
                        en: "🇬🇧 English",
                        de: "🇩🇪 German",
                        et: "🇪🇪 Estonian",
                        fi: "🇫🇮 Finnish",
                        fr: "🇫🇷 French",
                        nl: "🇳🇱 Dutch",
                        pt: "🇵🇹 Portuguese",
                        sv: "🇸🇪 Swedish",
                        uk: "🇺🇦 Ukrainian",
                      };
                      const languageText = languageMap[locale] || toUpper(locale);
                      const flagOnly = languageText.split(" ")[0];
                      return (
                        <Option value={locale} key={locale} label={flagOnly}>
                          {languageText}
                        </Option>
                      );
                    })}
                  </Select>
                </Space>
              </Col>
            </Row>
          </Header>
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
          <div id="footer" />
        </Layout>
        {contextHolder}
      </Layout>
  );
}
