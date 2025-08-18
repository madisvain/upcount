import { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Button, Col, Input, Space, Table, Typography, Row, Checkbox } from "antd";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";
import { ProjectOutlined, PlusOutlined } from "@ant-design/icons";
import filter from "lodash/filter";
import get from "lodash/get";
import includes from "lodash/includes";
import some from "lodash/some";
import toString from "lodash/toString";
import dayjs from "dayjs";

import { projectsAtom, setProjectsAtom } from "src/atoms/project";
import { useDateFormatter } from "src/utils/date";
import ProjectForm from "src/components/projects/form";

const { Title } = Typography;

const searchAtom = atom<string>("");

const Projects = () => {
  useLingui();
  const location = useLocation();
  const navigate = useNavigate();
  const formatDate = useDateFormatter();
  const projects = useAtomValue(projectsAtom);
  const setProjects = useSetAtom(setProjectsAtom);
  const [search, setSearch] = useAtom(searchAtom);

  useEffect(() => {
    if (location.pathname === "/projects") {
      setProjects();
    }
  }, [location, setProjects]);

  const searchProjects = () => {
    return filter(projects, (project: any) => {
      return some(["name", "clientName"], (field) => {
        const value = get(project, field);
        return includes(toString(value).toLowerCase(), search.toLowerCase());
      });
    });
  };

  const handleNewProject = () => {
    navigate(location.pathname, { state: { projectModal: true } });
  };

  const handleEditProject = (projectId: string) => {
    navigate(location.pathname, { state: { projectModal: true, projectId } });
  };

  const columns = [
    {
      title: <Trans>Name</Trans>,
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Button type="link" onClick={() => handleEditProject(record.id)} style={{ padding: 0, height: "auto" }}>
          {text}
        </Button>
      ),
    },
    {
      title: <Trans>Client</Trans>,
      dataIndex: "clientId",
      key: "client",
      render: (clientId: string, record: any) => {
        return record.clientName ? (
          <Link to={`/clients`} state={{ clientModal: true, clientId }}>
            {record.clientName}
          </Link>
        ) : (
          <span style={{ color: "#999" }}>
            <Trans>No client assigned</Trans>
          </span>
        );
      },
    },
    {
      title: <Trans>Timeframe</Trans>,
      key: "timeframe",
      render: (record: any) => {
        const startDate = record.startDate ? formatDate(dayjs.unix(record.startDate)) : null;
        const endDate = record.endDate ? formatDate(dayjs.unix(record.endDate)) : null;

        if (startDate && endDate) {
          return `${startDate} - ${endDate}`;
        } else if (startDate) {
          return `${startDate} - ongoing`;
        } else if (endDate) {
          return `- ${endDate}`;
        } else {
          return "-";
        }
      },
    },
    {
      title: <Trans>Archived</Trans>,
      key: "archived",
      width: 80,
      align: "center" as const,
      render: (record: any) => {
        return <Checkbox checked={!!record.archivedAt} disabled />;
      },
      filters: [
        { text: <Trans>Active</Trans>, value: "active" },
        { text: <Trans>Archived</Trans>, value: "archived" },
      ],
      filterMultiple: false,
      filterResetToDefaultFilteredValue: true,
      defaultFilteredValue: ["active"],
      onFilter: (value: any, record: any) => {
        const isArchived = !!record.archivedAt;
        if (value === "active") {
          return !isArchived;
        } else if (value === "archived") {
          return isArchived;
        }
        return false;
      },
    },
  ];

  const filteredProjects = searchProjects();

  return (
    <>
      <Row>
        <Col span={12}>
          <Title level={3} style={{ marginTop: 0, marginBottom: 0 }}>
            <ProjectOutlined style={{ marginRight: 8 }} />
            <Trans>Projects</Trans>
          </Title>
        </Col>
        <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
          <Space style={{ alignItems: "start" }}>
            <Input.Search
              placeholder={t`Search projects...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
            <Button type="primary" onClick={handleNewProject} icon={<PlusOutlined />} style={{ marginBottom: 10 }}>
              <Trans>New Project</Trans>
            </Button>
          </Space>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filteredProjects}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: t`No projects found`,
        }}
      />

      <ProjectForm />
      <Outlet />
    </>
  );
};

export default Projects;
