import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Form, Input, Modal, Select, Button, Popconfirm, DatePicker } from "antd";
import { atom, useAtom, useSetAtom } from "jotai";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { 
  projectsAtom,
  createProjectAtom,
  updateProjectAtom,
  archiveProjectAtom,
  unarchiveProjectAtom
} from "src/atoms/project";
import { clientsAtom, setClientsAtom } from "src/atoms/client";
import { useDatePickerFormat } from "src/utils/date";

const submittingAtom = atom(false);
const projectIdAtom = atom<string | null>(null);

const ProjectForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const dateFormat = useDatePickerFormat();

  const [projectId, setProjectId] = useAtom(projectIdAtom);
  const [projects] = useAtom(projectsAtom);
  const [clients] = useAtom(clientsAtom);
  const [submitting, setSubmitting] = useAtom(submittingAtom);
  const setClients = useSetAtom(setClientsAtom);
  const createProject = useSetAtom(createProjectAtom);
  const updateProject = useSetAtom(updateProjectAtom);
  const archiveProject = useSetAtom(archiveProjectAtom);
  const unarchiveProject = useSetAtom(unarchiveProjectAtom);

  const project = projects.find(p => p.id === projectId);
  const isVisible = location.state?.projectModal === true;

  useEffect(() => {
    if (isVisible && location.state?.projectId) {
      setProjectId(location.state.projectId);
    } else if (isVisible) {
      setProjectId(null);
    }
  }, [isVisible, location.state?.projectId, setProjectId]);

  useEffect(() => {
    if (isVisible) {
      setClients();
    }
  }, [isVisible, setClients]);

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        clientId: project.clientId,
        startDate: project.startDate ? dayjs.unix(project.startDate) : null,
        endDate: project.endDate ? dayjs.unix(project.endDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const projectData = {
        name: values.name,
        clientId: values.clientId || null,
        startDate: values.startDate ? values.startDate.unix() : null,
        endDate: values.endDate ? values.endDate.unix() : null,
      };

      if (projectId) {
        await updateProject(projectId, projectData);
      } else {
        await createProject(projectData);
      }

      setProjectId(null);
      navigate(location.pathname, { state: { projectModal: false } });
      form.resetFields();
    } catch (error) {
      console.error("Error saving project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async () => {
    if (projectId) {
      setSubmitting(true);
      try {
        if (project?.archivedAt) {
          await unarchiveProject(projectId);
        } else {
          await archiveProject(projectId);
        }
        setProjectId(null);
        navigate(location.pathname, { state: { projectModal: false } });
        form.resetFields();
      } catch (error) {
        console.error("Error archiving/unarchiving project:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setProjectId(null);
    navigate(location.pathname, { state: { projectModal: false } });
    form.resetFields();
  };

  return (
    <Modal
      title={projectId ? <Trans>Edit Project</Trans> : <Trans>New Project</Trans>}
      open={isVisible}
      onCancel={handleCancel}
      footer={[
        <div key="footer" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div>
            {projectId && (
              <Popconfirm
                title={
                  project?.archivedAt 
                    ? <Trans>Are you sure you want to unarchive this project?</Trans>
                    : <Trans>Are you sure you want to archive this project?</Trans>
                }
                onConfirm={handleArchive}
                okText={<Trans>Yes</Trans>}
                cancelText={<Trans>No</Trans>}
                placement="topRight"
              >
                <Button
                  icon={<InboxOutlined />}
                  loading={submitting}
                >
                  {project?.archivedAt ? <Trans>Unarchive</Trans> : <Trans>Archive</Trans>}
                </Button>
              </Popconfirm>
            )}
          </div>
          <div>
            <Button
              onClick={handleCancel}
              style={{ marginRight: 8 }}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="primary"
              loading={submitting}
              onClick={() => form.submit()}
            >
              {projectId ? <Trans>Update</Trans> : <Trans>Create</Trans>}
            </Button>
          </div>
        </div>
      ]}
      destroyOnHidden
      forceRender
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={<Trans>Project Name</Trans>}
          rules={[{ required: true, message: t`Please enter a project name` }]}
        >
          <Input placeholder={t`Enter project name`} />
        </Form.Item>

        <Form.Item
          name="clientId"
          label={<Trans>Client</Trans>}
        >
          <Select
            placeholder={t`Select a client (optional)`}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {clients.map((client: any) => (
              <Select.Option key={client.id} value={client.id}>
                {client.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label={<Trans>Start Date</Trans>}
        >
          <DatePicker style={{ width: "100%" }} format={dateFormat} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label={<Trans>End Date</Trans>}
        >
          <DatePicker style={{ width: "100%" }} format={dateFormat} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProjectForm;