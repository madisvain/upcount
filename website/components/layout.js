import Head from 'next/head';
import Drift from 'react-driftjs';

export default ({ children, title = 'Upcount - easy invoicing application' }) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="description"
        content="Upcount is a painless cross-platform invoicing application, built with React & Electron and simplicity in mind."
      />
    </Head>

    {children}

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

    <Drift appId="nn2ai4nf33ka" />
  </div>
);
