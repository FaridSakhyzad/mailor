import { connection } from "../main";
export const getEmailHeaders = async () => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM email_template_headers', function (error, results, fields) {
            if (error) {
                throw error;
            }

            resolve(results);
        })
    });
};
