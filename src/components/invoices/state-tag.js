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
    <Tag
      color={color}
      onClick={props.onClick}
      style={{ fontSize: 14, padding: '4px 8px', marginTop: 12 }}
    >
      {state}
    </Tag>
  );
};

export default StateTag;
