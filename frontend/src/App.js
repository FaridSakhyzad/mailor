import axios from "axios";
import { useEffect, useState } from 'react';
import php from 'phpjs';
import './App.css';

function App() {
  const [ emailHeaders, setEmailHeaders ] = useState();
  const [ emailBodies, setEmailBodies ] = useState();

  const [ activeHeaderIndex, setActiveHeaderIndex ] = useState(0);
  const [ activeTemplateIndex, setActiveTemplateIndex ] = useState(0);

  const [ headerMarkup, setHeaderMarkup ] = useState();
  const [ bodyMarkup, setBodyMarkup ] = useState();

  const fetchData = async () => {
    const storedHeaderIndex = parseInt(localStorage.getItem('storedHeaderIndex') || 0, 10);
    const storedBodyIndex = parseInt(localStorage.getItem('storedBodyIndex') || 0, 10);

    const emailHeaders = await axios.get('http://localhost:3031/emailHeaders');
    const emailBodies = await axios.get('http://localhost:3031/emailBodies');

    setEmailHeaders(emailHeaders.data);
    setEmailBodies(emailBodies.data);

    setActiveHeaderIndex(storedHeaderIndex);
    setActiveTemplateIndex(storedBodyIndex);

    const headerMarkup = await fetchHeaderFile(emailHeaders.data[storedHeaderIndex].email_template_headers_id);
    const bodyMarkup = await fetchBodyFile(emailBodies.data[storedBodyIndex].email_template_id);

    setHeaderMarkup(headerMarkup);
    setBodyMarkup(bodyMarkup);
  }

  const extractTemplates = async () => {
    await axios.post('http://localhost:3031/extractEmailData');
  }

  const publishTemplateHeader = async () => {
    await axios.post('http://localhost:3031/publishHeader', {
      id: emailHeaders[activeHeaderIndex].email_template_headers_id,
    });
  }

  const publishTemplateBody = async () => {
    await axios.post('http://localhost:3031/publishTemplate', {
      id: emailBodies[activeTemplateIndex].email_template_id,
    });
  }

  const fetchHeaderFile = async (id) => {
    const response = await axios.get(`http://localhost:3031/emailHeaderFile/${id}`);

    return response.data;
  }

  const fetchBodyFile = async (id) => {
    const response = await axios.get(`http://localhost:3031/emailBodyFile/${id}`);

    return response.data;
  }

  const sendTemplateToEmail = async () => {
    const response = await axios.post('http://localhost:3031/sendTemplate', {
      html: getSrcDoc(),
    });

    return response.data;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleHeaderChange = async (e) => {
    const headerIndex = emailHeaders.findIndex(({ email_template_headers_id }) => `${email_template_headers_id}` === e.target.value);

    setActiveHeaderIndex(headerIndex);

    localStorage.setItem('storedHeaderIndex', headerIndex);

    const headerMarkup = await fetchHeaderFile(emailHeaders[headerIndex].email_template_headers_id);
    setHeaderMarkup(headerMarkup);
  }

  const handleBodyChange = async (e) => {
    const templateIndex = emailBodies.findIndex(({ email_template_id }) => `${email_template_id}` === e.target.value);
    setActiveTemplateIndex(templateIndex);

    localStorage.setItem('storedBodyIndex', templateIndex);

    const bodyMarkup = await fetchBodyFile(emailBodies[templateIndex].email_template_id);
    setBodyMarkup(bodyMarkup);


    const headerIndex = emailHeaders.findIndex(({ email_template_headers_id }) => email_template_headers_id === emailBodies[templateIndex].email_template_header);

    setActiveHeaderIndex(headerIndex);

    localStorage.setItem('storedHeaderIndex', emailBodies[templateIndex].email_template_header);

    const headerMarkup = await fetchHeaderFile(emailBodies[templateIndex].email_template_header);
    setHeaderMarkup(headerMarkup);
  }

  const getSrcDoc = () => {
    if (!headerMarkup || !bodyMarkup) {
      return '';
    }

    return headerMarkup.replace('{CONTENT}', bodyMarkup);
  }

  return (
    <div className="App">
      <header className="header">
        <nav className="navbar bg-body-tertiary">
          <div className="container">
            <div className="header-menu">
              <div className="header-publish">
                <div className="row">
                  <div className="col">
                    {/*<button className="btn btn-primary" onClick={extractTemplates}>Extract</button>*/}
                  </div>
                  <div className="col">
                    <button className="btn btn-primary" onClick={publishTemplateHeader}>Publish Header</button>
                  </div>
                  <div className="col">
                    <button className="btn btn-primary" onClick={publishTemplateBody}>Publish Body</button>
                  </div>
                </div>
              </div>
              <div className="header-sendto">
                <div className="row">
                  <div className="col-auto">
                    <input type="email" placeholder="Email" className="form-control" />
                  </div>
                  <div className="col-auto">
                    <button className="btn btn-primary" onClick={sendTemplateToEmail}>Go</button>
                  </div>
                </div>
              </div>
              <div className="header-filters">
                <div className="row">
                  <div className="col-auto">
                    <div className="row align-items-center">
                      <div className="col-auto">Header + Footer</div>
                      <div className="col-auto">
                        {emailHeaders && (
                          <select
                            className="form-select header-filters--headers"
                            onChange={handleHeaderChange}
                            value={emailHeaders[activeHeaderIndex].email_template_headers_id}
                          >
                            {emailHeaders && emailHeaders.map((header) => {
                              const { email_template_headers_id, email_template_headers_name } = header;

                              return (
                                <option value={email_template_headers_id} key={email_template_headers_id}>
                                  {email_template_headers_name} | {email_template_headers_id}
                                </option>
                              )
                            })}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-auto"></div>
                  <div className="col-auto">
                    <div className="row align-items-center">
                      <div className="col-auto">Email Body</div>
                      <div className="col-auto">
                        {emailBodies && (
                          <select
                            className="form-select header-filters--bodies"
                            onChange={handleBodyChange}
                            value={emailBodies[activeTemplateIndex].email_template_id}
                          >
                            {emailBodies && emailBodies.map((template) => {
                              const { email_template_id, email_template_name } = template;

                              return (
                                <option value={email_template_id} key={email_template_id}>
                                  {email_template_name} | {email_template_id}
                                </option>
                              )
                            })}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="main">
        <div className="container">
          <div className="row">
            <div className="col-8">
              {(emailHeaders && emailBodies) && (
                <iframe className="theFrame" srcDoc={getSrcDoc()} sandbox="allow-same-origin" />
              )}
            </div>
            <div className="col-4">
              <div className="row g-3">
                <div className="col-12">
                  {emailHeaders && (
                    <>
                      <h5>Header + Footer: <b>{emailHeaders[activeHeaderIndex].email_template_headers_name}</b></h5>
                      <hr />
                      <div className="row gy-2">
                        <div className="col-4">Id:</div>
                        <div className="col-8">{emailHeaders[activeHeaderIndex].email_template_headers_id}</div>

                        <div className="col-4">Sent from:</div>
                        <div className="col-8">{emailHeaders[activeHeaderIndex].email_template_headers_sent_from}</div>

                        <div className="col-4">Sent to:</div>
                        <div className="col-8">{emailHeaders[activeHeaderIndex].email_template_headers_sent_to}</div>

                        <div className="col-4">Sent name:</div>
                        <div className="col-8">{emailHeaders[activeHeaderIndex].email_template_headers_sent_name}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="col-12" />
                <div className="col-12" />
                <div className="col-12">
                  {emailBodies && (
                    <>
                      <h5>Body: <b>{emailBodies[activeTemplateIndex].email_template_name}</b></h5>
                      <hr />
                      <div className="row gy-2">
                        <div className="col-4">Id:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_id}</div>

                        <div className="col-4">Attachment:</div>
                        <div className="col-8">
                          <pre>
                            {JSON.stringify(php.unserialize(emailBodies[activeTemplateIndex].email_template_attachment), null, 2)}
                          </pre>
                        </div>

                        <div className="col-4">Button:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_button}</div>

                        <div className="col-4">Header:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_header}</div>

                        <div className="col-4">Order:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_order}</div>

                        <div className="col-4">Show in:</div>
                        <div className="col-8 text-break">{emailBodies[activeTemplateIndex].email_template_show_in}</div>

                        <div className="col-4">Static:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_static}</div>

                        <div className="col-4">Subj:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_subj}</div>

                        <div className="col-4">Tag:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_tag}</div>

                        <div className="col-4">Tag version:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_tag_version}</div>

                        <div className="col-4">Utm_campaign:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_utm_campaign}</div>

                        <div className="col-4">Utm_source:</div>
                        <div className="col-8">{emailBodies[activeTemplateIndex].email_template_utm_source}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
