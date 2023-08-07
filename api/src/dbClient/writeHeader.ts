import * as fs from 'fs';
import { connection } from "../main";

export const writeHeaderFileToDb = async (id) => {
    const file = fs.readFileSync(`../emailHeaders/${id}.html`, 'utf8');

    return new Promise((resolve, reject) => {
        const query = 'UPDATE email_template_headers SET email_template_headers_html = ? WHERE email_template_headers_id = ?';

        connection.query(query, [file, id], function (error, results, fields) {
            if (error) {
                throw error;
            }

            resolve(results);
        })
    });
}
