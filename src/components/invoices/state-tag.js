import { Tag } from 'antd';
import { Trans } from '@lingui/macro';

const states = {
  draft: <Trans>Draft</Trans>,
  confirmed: <Trans>Confirmed</Trans>,
  paid: <Trans>Paid</Trans>,
  void: <Trans>Void</Trans>,
};

const StateTag = props => {
  const { state } = props;

  let color;
  switch (state) {
    case 'draft':
      color = 'gold';
      break;
    case 'confirmed':
      color = 'blue';
      break;
    case 'paid':
      color = 'green';
      break;
    case 'void':
      color = 'red';
      break;
    default:
      color = null;
  }
  return (
    <Tag color={color} onClick={props.onClick}>
      {states[state]}
    </Tag>
  );
};

export default StateTag;
