import * as fs from 'fs';

export const readLocalStylesFromFs = (id) => {
  return fs.readFileSync(`../../cf-future/templates/emails/${id}.html`, 'utf8');
};
