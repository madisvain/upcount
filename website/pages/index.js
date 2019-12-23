import './styles.scss';

import React from 'react';

import Download from '../components/download';
import { initGA, logPageView } from '../utils/analytics';

export default class Index extends React.Component {
  componentDidMount() {
    if (!window.GA_INITIALIZED) {
      initGA();
      window.GA_INITIALIZED = true;
    }
    logPageView();
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand">
          <span className="navbar-brand h1">
            <img src="/logo.svg" className="img-fluid" alt="Logo" />
          </span>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item mr-2 mt-1">
              <Download />
            </li>
            <li className="nav-item">
              <a href="https://github.com/madisvain/upcount" target="_blank">
                <img src="/github.svg" className="img-fluid" alt="Logo" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Landing & Download */}
        <div className="container">
          <div className="row" style={{ marginTop: 40 }}>
            <div className="col-8 offset-2">
              <h1 className="text-center">Easy Invocing</h1>
              <ul className="list-inline text-center mt-4">
                <li className="list-inline-item">
                  <Download os="mac" primary={true} />
                </li>
                <li className="list-inline-item">
                  <Download os="windows" primary={true} />
                </li>
                <li className="list-inline-item">
                  <Download os="linux" primary={true} />
                </li>
              </ul>
              <p className="text-center">
                <small>
                  Upcount is free to download and use and is available for Windows, Mac and Linux.
                </small>
              </p>
              <figure className="figure">
                <img src="/illustration.svg" className="figure-img img-fluid" alt="Illustration" />
                <figcaption className="figure-caption text-right">
                  <blockquote className="blockquote">
                    <p className="mb-0">“Cats will outsmart dogs every time.”</p>
                    <footer className="blockquote-footer">John Grogan</footer>
                  </blockquote>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        {/* Screenshots */}
        <div className="container">
          <div className="row" style={{ marginTop: 80 }}>
            <div className="col col-sm-6">
              <img src="screenshots/invoices.png" className="img-fluid" alt="Invoices list" />
            </div>
            <div className="col col-sm-6">
              <h2 className="mt-4 mb-4">Keep invoices in check</h2>
              <p>
                Upcount is a beautifully-simple desktop app designed to help manage your invoicing.
                Easily keep track of invoice payments, overdue invoices via invoice states.
              </p>
              <ul className="list-unstyled mt-2">
                <li>
                  <span className="badge badge-secondary">Draft</span>
                </li>
                <li>
                  <span className="badge badge-primary">Confirmed</span>
                </li>
                <li>
                  <span className="badge badge-success">Payed</span>
                </li>
                <li>
                  <span className="badge badge-warning">Overdue</span>
                </li>
                <li>
                  <span className="badge badge-danger">Void</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="row" style={{ marginTop: 80 }}>
            <div className="col col-sm-6">
              <h2 className="mt-4 mb-4 text-right">Clean user experience</h2>
              <p className="text-right">
                Easy to understand and use invoice creation interface.
                <br />
                <i>What you see is what you get.</i>
              </p>
            </div>
            <div className="col col-sm-6">
              <img src="screenshots/invoice-edit.png" className="img-fluid" alt="Invoice editing" />
            </div>
          </div>
          <div className="row" style={{ marginTop: 80 }}>
            <div className="col col-sm-6">
              <img src="screenshots/settings.png" className="img-fluid" alt="Invoice settings" />
            </div>
            <div className="col col-sm-6">
              <h2 className="mt-4 mb-4">Configurable options</h2>
              <p>Customize the invoices according to your needs and preferences.</p>
              <ul className="list-unstyled mt-2">
                <li>Upload your company logo</li>
                <li>Set payment terms & overdue charges</li>
                <li>Set up tax rates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="container">
          <div className="row" style={{ marginTop: 100, marginBottom: 20 }}>
            <div className="col text-center">
              Made with <span style={{ color: '#e25555' }}>&hearts;</span> for coding by{' '}
              <a href="https://github.com/madisvain">Madis Väin</a>
              <br />
              <small>Estonia, Tallinn</small>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
