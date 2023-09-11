import * as fs from 'fs';

export const readStylesFromFs = () => {
  return fs.readFileSync(
    '../../cf-future/templates/emails/globalstyle.html',
    'utf8',
  );
};
