import { Component } from 'react';
import { connect } from 'dva';

class Index extends Component {
  render() {
    return (
      <div>
        Settings
        </div>
    )
  }
}

export default connect((state) => { return { invoice: state.invoice }; })(Index);