import * as fs from 'fs';
import { connection } from "../main";

export const writeTemplateFileToDb = async (id) => {
    const file = fs.readFileSync(`../emailTemplates/${id}.html`, 'utf8');

    return new Promise((resolve, reject) => {
        const query = 'UPDATE email_templates SET email_template_body_html = ? WHERE email_template_id = ?';

        connection.query(query, [file, id], function (error, results, fields) {
            if (error) {
                throw error;
            }

            resolve(results);
        })
    });
}
