import * as fs from 'fs';

export const writeHeadersToFs = (data) => {
  data.forEach((item) => {
    const {
      email_template_headers_id,
      email_template_headers_html
    } = item

    fs.writeFileSync(`../emailHeaders/${email_template_headers_id}.html`, email_template_headers_html, {});
  });
}

export const writeTemplatesToFs = (data) => {
  data.forEach((item) => {
    const {
      email_template_id,
      email_template_body_html
    } = item

    fs.writeFileSync(`../emailTemplates/${email_template_id}.html`, email_template_body_html, {});
  });
}
