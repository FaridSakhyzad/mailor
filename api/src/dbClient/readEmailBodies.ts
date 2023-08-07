import { connection } from "../main";

export const getEmailTemplates = async () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM email_templates', function (error, results, fields) {
            if (error) {
                throw error;
            }

            resolve(results);
        })
    });
};
