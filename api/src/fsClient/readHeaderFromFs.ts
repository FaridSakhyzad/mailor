import * as fs from 'fs';

export const readHeaderFromFs = (id) => {
    return fs.readFileSync(`../emailHeaders/${id}.html`, 'utf8');
}
