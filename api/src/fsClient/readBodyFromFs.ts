import * as fs from 'fs';

export const readBodyFromFs = (id) => {
    return fs.readFileSync(`../emailTemplates/${id}.html`, 'utf8');
}
