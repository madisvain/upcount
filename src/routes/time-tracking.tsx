import { Col, Row, Alert } from "antd";

const TimeTracking = () => {
  return (
    <>
      <Row justify="center">
        <Col span={12} style={{ paddingTop: 60 }}>
          <Alert
            message="Under Development"
            description={
              <>
                Our time tracking feature is currently being developed.
                <br />
                <br />
                Check back soon for updates!
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
