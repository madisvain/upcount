import './styles.scss';

export default () => (
  <div>
    <nav className="navbar navbar-dark bg-dark">
      <span className="navbar-brand mx-auto h1">
        <img src="/logo.svg" className="img-fluid" alt="Logo" />
      </span>
    </nav>
    <div className="container-fluid">
      <div className="row" style={{ marginTop: 80 }}>
        <div className="col-8 offset-2">
          <h1 className="text-center">
            <small>💊</small> Painless invocing
          </h1>
          <img src="/illustration.svg" className="img-fluid" alt="Illustration" />
        </div>
      </div>
    </div>
  </div>
);
