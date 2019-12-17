import './styles.scss';

export default () => (
  <div>
    <nav className="navbar">
      <span className="navbar-brand h1">
        <img src="/logo.svg" className="img-fluid" alt="Logo" />
      </span>
      <ul class="navbar-nav ml-auto">
        <a href="https://github.com/madisvain/upcount" target="_blank">
          <img src="/github.svg" className="img-fluid" alt="Logo" />
        </a>
      </ul>
    </nav>
    <div className="row" style={{ marginTop: 40 }}>
      <div className="col-8 offset-2">
        <h1 className="text-center">Easy Invocing</h1>
        <ul className="list-inline text-center mt-4">
          <li class="list-inline-item">
            <button type="button" className="btn btn-primary">
              Mac
            </button>
          </li>
          <li class="list-inline-item">
            <button type="button" className="btn btn-outline-secondary">
              Windows
            </button>
          </li>
          <li class="list-inline-item">
            <button type="button" className="btn btn-outline-secondary">
              Linux
            </button>
          </li>
        </ul>
        <p className="text-center">
          <small>
            Upcount is free to download and use and is available for Windows, Mac and Linux.
          </small>
        </p>
        <figure class="figure">
          <img src="/illustration.svg" className="figure-img img-fluid" alt="Illustration" />
          <figcaption class="figure-caption text-right">
            <blockquote class="blockquote">
              <p className="mb-0">“Cats will outsmart dogs every time.”</p>
              <footer class="blockquote-footer">John Grogan</footer>
            </blockquote>
          </figcaption>
        </figure>
      </div>
    </div>
    <div className="container-fluid">
      <div className="row" style={{ marginTop: 80 }}>
        <div className="col col-sm-6">
          <img src="screenshots/invoices.png" className="img-fluid" alt="Invoices list" />
        </div>
        <div className="col col-sm-6">
          <h2 className="mt-4 mb-4">Upcount invoicing app</h2>
          <p>
            Upcount is a beautifully-simple desktop app designed to help manage your invoicing.
            Easily keep track of invoice payments, overdue invoices via invoice states.
            <ul class="list-unstyled mt-2">
              <li>
                <span class="badge badge-secondary">Draft</span>
              </li>
              <li>
                <span class="badge badge-primary">Confirmed</span>
              </li>
              <li>
                <span class="badge badge-success">Payed</span>
              </li>
              <li>
                <span class="badge badge-warning">Overdue</span>
              </li>
              <li>
                <span class="badge badge-danger">Void</span>
              </li>
            </ul>
          </p>
        </div>
      </div>
      <div className="row" style={{ marginTop: 80 }}>
        <div className="col col-sm-6">
          <img src="screenshots/invoice-edit.png" className="img-fluid" alt="Invoice editing" />
        </div>
      </div>
      <div className="row" style={{ marginTop: 80 }}>
        <div className="col col-sm-6">
          <img src="screenshots/settings.png" className="img-fluid" alt="Invoice settings" />
        </div>
      </div>
    </div>
  </div>
);
