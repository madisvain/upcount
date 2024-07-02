import { Col, Row, Alert } from "antd";
import { t, Trans } from "@lingui/macro";

const TimeTracking = () => {
  return (
    <>
      <Row justify="center">
        <Col span={12} style={{ paddingTop: 60 }}>
          <Alert
            message={t`Under Development`}
            description={
              <>
                <Trans>Our time tracking feature is currently being developed.</Trans>
                <br />
                <br />
                <Trans>Check back soon for updates!</Trans>
              </>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </>
  );
};

export default TimeTracking;
