import { Tag } from 'antd';

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
      {state}
    </Tag>
  );
};

export default StateTag;
