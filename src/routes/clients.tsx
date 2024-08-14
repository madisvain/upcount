import { useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Button, Col, Input, Space, Table, Typography, Row, Tag } from "antd";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { PhoneOutlined, TeamOutlined } from "@ant-design/icons";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import get from "lodash/get";
import includes from "lodash/includes";
import some from "lodash/some";
import toString from "lodash/toString";

import { clientsAtom, setClientsAtom } from "src/atoms";
import ClientForm from "src/components/clients/form";

const { Title } = Typography;

const searchAtom = atom<string>("");

const Clients = () => {
  useLingui();
  const location = useLocation();
  const clients = useAtomValue(clientsAtom);
  const setClients = useSetAtom(setClientsAtom);
  const [search, setSearch] = useAtom(searchAtom);

  useEffect(() => {
    if (location.pathname === "/clients") {
      setClients();
    }
  }, [location]);

  const searchClients = () => {
    return filter(clients, (client: any) => {
      return some(["name", "registration_number", "address", "emails", "phone", "vatin", "website"], (field) => {
        const value = get(client, field);
        return includes(toString(value).toLowerCase(), search.toLowerCase());
      });
    });
  };

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            <TeamOutlined style={{ marginRight: 8 }} />
            <Trans>Clients</Trans>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space style={{ alignItems: "start" }}>
            <Input.Search placeholder={t`Search text`} onChange={(e) => setSearch(e.target.value)} />
            <Link to="/clients" state={{ clientModal: true }}>
              <Button type="primary" style={{ marginBottom: 10 }}>
                <Trans>New client</Trans>
              </Button>
            </Link>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Table dataSource={search ? searchClients() : clients} pagination={false} rowKey="id">
            <Table.Column
              title={<Trans>Name</Trans>}
              key="name"
              sorter={(a: any, b: any) => (a.name < b.name ? -1 : a.name === b.name ? 0 : 1)}
              render={(client) => (
                <Link to={`/clients`} state={{ clientModal: true, clientId: client.id }}>
                  {client.name}
                </Link>
              )}
            />
            <Table.Column title={<Trans>Address</Trans>} dataIndex="address" key="address" />
            <Table.Column
              title={<Trans>Emails</Trans>}
              dataIndex="emails"
              key="emails"
              render={(emails: string) =>
                emails ? JSON.parse(emails).map((email: string) => <Tag key={email}>{email}</Tag>) : ""
              }
            />
            <Table.Column
              title={<Trans>Phone</Trans>}
              dataIndex="phone"
              key="phone"
              render={(phone) => {
                if (!isEmpty(phone)) {
                  return (
                    <a href={`tel:${phone}`}>
                      <PhoneOutlined />
                      {` ${phone}`}
                    </a>
                  );
                }
              }}
            />
            <Table.Column title={<Trans>VATIN</Trans>} dataIndex="vatin" key="vatin" />
            <Table.Column
              title={<Trans>Website</Trans>}
              dataIndex="website"
              key="website"
              render={(website) => (
                <a href={website} target="_blank" rel="noreferrer noopener">
                  {website}
                </a>
              )}
            />
          </Table>
          <Outlet />
        </Col>
      </Row>

      <ClientForm />
    </>
  );
};

export default Clients;
