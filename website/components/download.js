export default class Download extends React.Component {
  state = {
    os: null,
    hover: false,
    primary: false,
  };

  componentDidMount() {
    if (this.props.os) {
      this.setState({ os: this.props.os });
    } else if (!this.state.os) {
      if (navigator.appVersion.indexOf('Win') !== -1) {
        this.setState({ os: 'windows' });
      } else if (navigator.appVersion.indexOf('Mac') !== -1) {
        this.setState({ os: 'mac' });
      } else if (navigator.appVersion.indexOf('X11') !== -1) {
        this.setState({ os: 'unix' });
      } else if (navigator.appVersion.indexOf('Linux') !== -1) {
        this.setState({ os: 'linux' });
      }
    }
  }

  render() {
    const { hover, os } = this.state;

    if (os === 'windows') {
      return (
        <a
          href="#"
          className="btn btn-sm btn-outline-dark"
          onMouseEnter={() => this.setState({ hover: true })}
          onMouseLeave={() => this.setState({ hover: false })}
        >
          Download
          <img
            src={hover ? '/windows.svg' : '/windows-dark.svg'}
            className="img-fluid ml-1 mb-1"
            alt="Windows"
          />
        </a>
      );
    } else if (os === 'mac') {
      return (
        <a
          href="#"
          className="btn btn-sm btn-outline-dark"
          onMouseEnter={() => this.setState({ hover: true })}
          onMouseLeave={() => this.setState({ hover: false })}
        >
          Download
          <img
            src={hover ? '/apple.svg' : '/apple-dark.svg'}
            className="img-fluid ml-1 mb-1"
            alt="Mac"
          />
        </a>
      );
    } else if (os === 'linux' || os === 'unix') {
      return (
        <a
          href="#"
          className="btn btn-sm btn-outline-dark"
          onMouseEnter={() => this.setState({ hover: true })}
          onMouseLeave={() => this.setState({ hover: false })}
        >
          Download
          <img
            src={hover ? '/linux.svg' : '/linux-dark.svg'}
            className="img-fluid ml-1 mb-1"
            alt="Linux"
          />
        </a>
      );
    } else {
      return (
        <a
          href="#"
          className="btn btn-sm btn-outline-dark"
          onMouseEnter={() => this.setState({ hover: true })}
          onMouseLeave={() => this.setState({ hover: false })}
        >
          Download
        </a>
      );
    }
  }
}
