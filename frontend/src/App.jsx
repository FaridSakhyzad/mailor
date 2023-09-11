import React, { useEffect, useState } from 'react';
import axios from 'axios';
import php from 'phpjs';
import './App.css';

function App() {
  const [emailHeaders, setEmailHeaders] = useState();
  const [emailBodies, setEmailBodies] = useState();
  const [globalStyles, setGlobalStyles] = useState();
  const [localStyles, setLocalStyles] = useState();

  const [activeHeaderIndex, setActiveHeaderIndex] = useState(0);
  const [activeBodyIndex, setActiveBodyIndex] = useState(0);

  const [headerMarkup, setHeaderMarkup] = useState();
  const [bodyMarkup, setBodyMarkup] = useState();

  const fetchHeaderFile = async (id) => {
    const response = await axios.get(`http://localhost:3031/emailHeaderFile/${id}`);

    return response.data;
  };

  const fetchBodyFile = async (id) => {
    const response = await axios.get(`http://localhost:3031/emailBodyFile/${id}`);

    return response.data;
  };

  const fetchData = async () => {
    let storedHeaderIndex = parseInt(localStorage.getItem('storedHeaderIndex') || 0, 10);
    let storedBodyIndex = parseInt(localStorage.getItem('storedBodyIndex') || 0, 10);

    const emailHeadersResponse = await axios
      .get('http://localhost:3031/emailHeaders')
      .catch((error) => {
        console.error('NETWORK ERROR', error);
      });

    const emailBodiesResponse = await axios
      .get('http://localhost:3031/emailBodies')
      .catch((error) => {
        console.error('NETWORK ERROR', error);
      });

    const globalStylesResponse = await axios
      .get('http://localhost:3031/getGlobalStyles')
      .catch((error) => {
        console.error('NETWORK ERROR', error);
      });

    const localStylesResponse = await axios
      .get('http://localhost:3031/getLocalStyles')
      .catch((error) => {
        console.error('NETWORK ERROR', error);
      });

    console.log('localStylesResponse', localStylesResponse);

    if (!emailHeadersResponse || !emailBodiesResponse || !globalStylesResponse) {
      return;
    }

    if (!emailHeadersResponse.data[storedHeaderIndex]) {
      storedHeaderIndex = 0;
    }

    if (!emailBodiesResponse.data[storedBodyIndex]) {
      storedBodyIndex = 0;
    }

    if (localStylesResponse) {
      setLocalStyles(localStylesResponse.data);
    } else {
      setLocalStyles('');
    }

    setGlobalStyles(globalStylesResponse.data);

    setEmailHeaders(emailHeadersResponse.data);
    setEmailBodies(emailBodiesResponse.data);

    const headerMarkupData = await fetchHeaderFile(emailHeadersResponse.data[storedHeaderIndex].email_template_headers_id);
    const bodyMarkupData = await fetchBodyFile(emailBodiesResponse.data[storedBodyIndex].email_template_id);

    setActiveHeaderIndex(storedHeaderIndex);
    setActiveBodyIndex(storedBodyIndex);

    setHeaderMarkup(headerMarkupData);
    setBodyMarkup(bodyMarkupData);
  };

  const getSrcDoc = () => {
    if (!headerMarkup || !bodyMarkup) {
      return '';
    }

    return headerMarkup.replace('{GLOBAL_STYLE}', globalStyles).replace('{LOCAL_STYLE}', localStyles).replace('{CONTENT}', bodyMarkup);
  };

  const extractTemplates = async () => {
    await axios.post('http://localhost:3031/extractEmailData');
  };

  const publishTemplateHeader = async () => {
    await axios.post('http://localhost:3031/publishHeader', {
      id: emailHeaders[activeHeaderIndex].email_template_headers_id,
    });
  };

  const publishTemplateBody = async () => {
    await axios.post('http://localhost:3031/publishTemplate', {
      id: emailBodies[activeBodyIndex].email_template_id,
    });
  };

  const [receivers, setReceivers] = useState('');

  const sendTemplateToEmail = async () => {
    if (!receivers.length) {
      return null;
    }

    const response = await axios.post('http://localhost:3031/sendTemplate', {
      html: getSrcDoc(),
      receivers,
    });

    if (response.data.error) {
      alert('Error Sending Email');
      return null;
    }

    alert('Email Sent');
    return response.data;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleHeaderChange = async (e) => {
    const headerIndex = emailHeaders
      .findIndex(({ email_template_headers_id: emailTemplateHeadersId }) => `${emailTemplateHeadersId}` === e.target.value);

    setActiveHeaderIndex(headerIndex);

    localStorage.setItem('storedHeaderIndex', headerIndex);

    const headerMarkupResponse = await fetchHeaderFile(emailHeaders[headerIndex].email_template_headers_id);
    setHeaderMarkup(headerMarkupResponse);
  };

  const handleBodyChange = async (e) => {
    const templateIndex = emailBodies.findIndex(({ email_template_id: emailTemplateId }) => `${emailTemplateId}` === e.target.value);
    setActiveBodyIndex(templateIndex);

    localStorage.setItem('storedBodyIndex', templateIndex);

    const bodyMarkupResponse = await fetchBodyFile(emailBodies[templateIndex].email_template_id);
    setBodyMarkup(bodyMarkupResponse);

    const headerIndex = emailHeaders.findIndex(({ email_template_headers_id: emailTemplateHeadersId }) => emailTemplateHeadersId === emailBodies[templateIndex].email_template_header);

    setActiveHeaderIndex(headerIndex);

    localStorage.setItem('storedHeaderIndex', emailBodies[templateIndex].email_template_header);

    const headerMarkupResponse = await fetchHeaderFile(emailBodies[templateIndex].email_template_header);
    setHeaderMarkup(headerMarkupResponse);
  };

  const handleEmailChange = ({ target: { value } }) => {
    setReceivers(value);
  };

  return (
    <div className="App">
      <header className="header">
        <nav className="navbar bg-body-tertiary">
          <div className="container">
            <div className="header-menu">
              <div className="header-publish">
                <div className="row">
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={extractTemplates}
                    >
                      Extract
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={publishTemplateHeader}
                    >
                      Publish Header
                    </button>
                  </div>
                  <div className="col">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={publishTemplateBody}
                    >
                      Publish Body
                    </button>
                  </div>
                </div>
              </div>
              <div className="header-sendto">
                <div className="row">
                  <div className="col-auto">
                    <input
                      type="email"
                      placeholder="Email"
                      className="form-control"
                      value={receivers}
                      onChange={handleEmailChange}
                    />
                  </div>
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={sendTemplateToEmail}
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
              <div className="header-filters">
                <div className="row">
                  <div className="col-auto">
                    <div className="row align-items-center justify-content-center">
                      <div className="col-auto">Header + Footer</div>
                      <div className="col-auto">
                        {emailHeaders && (
                          <select
                            className="form-select header-filters--headers"
                            onChange={handleHeaderChange}
                            value={emailHeaders[activeHeaderIndex].email_template_headers_id}
                          >
                            {emailHeaders && emailHeaders.map((header) => {
                              const {
                                email_template_headers_id: emailTemplateHeadersId,
                                email_template_headers_name: emailTemplateHeadersName,
                              } = header;

                              return (
                                <option value={emailTemplateHeadersId} key={emailTemplateHeadersId}>
                                  {/* eslint-disable-next-line */}
                                  {emailTemplateHeadersName} | {emailTemplateHeadersId}
                                </option>
                              );
                            })}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-auto" />
                  <div className="col-auto">
                    <div className="row align-items-center">
                      <div className="col-auto">Email Body</div>
                      <div className="col-auto">
                        {emailBodies && (
                          <select
                            className="form-select header-filters--bodies"
                            onChange={handleBodyChange}
                            value={emailBodies[activeBodyIndex].email_template_id}
                          >
                            {emailBodies && emailBodies.map((emailBody) => {
                              const {
                                email_template_id: emailTemplateId,
                                email_template_name: emailTemplateName,
                              } = emailBody;

                              return (
                                <option value={emailTemplateId} key={emailTemplateId}>
                                  {/* eslint-disable-next-line */}
                                  {emailTemplateName} | {emailTemplateId}
                                </option>
                              );
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
                <iframe
                  title="Email Preview Frame"
                  className="theFrame"
                  srcDoc={getSrcDoc()}
                  sandbox="allow-same-origin"
                />
              )}
            </div>
            <div className="col-4">
              <div className="row g-3">
                <div className="col-12">
                  {emailHeaders && (
                    <>
                      <h5>
                        Header + Footer:
                        {' '}
                        <b>{emailHeaders[activeHeaderIndex].email_template_headers_name}</b>
                      </h5>
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
                      <h5>
                        Body:
                        {' '}
                        <b>{emailBodies[activeBodyIndex].email_template_name}</b>
                      </h5>
                      <hr />
                      <div className="row gy-2">
                        <div className="col-4">Id:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_id}</div>

                        <div className="col-4">Attachment:</div>
                        <div className="col-8">
                          <pre>
                            {/* eslint-disable-next-line max-len */}
                            {JSON.stringify(php.unserialize(emailBodies[activeBodyIndex].email_template_attachment), null, 2)}
                          </pre>
                        </div>

                        <div className="col-4">Button:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_button}</div>

                        <div className="col-4">Header:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_header}</div>

                        <div className="col-4">Order:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_order}</div>

                        <div className="col-4">Show in:</div>
                        <div className="col-8 text-break">{emailBodies[activeBodyIndex].email_template_show_in}</div>

                        <div className="col-4">Static:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_static}</div>

                        <div className="col-4">Subj:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_subj}</div>

                        <div className="col-4">Tag:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_tag}</div>

                        <div className="col-4">Tag version:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_tag_version}</div>

                        <div className="col-4">Utm_campaign:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_utm_campaign}</div>

                        <div className="col-4">Utm_source:</div>
                        <div className="col-8">{emailBodies[activeBodyIndex].email_template_utm_source}</div>
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
