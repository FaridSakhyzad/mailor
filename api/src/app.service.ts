import { Injectable } from '@nestjs/common';
import { getEmailHeaders } from './dbClient/readEmailHeaders';
import { getEmailTemplates } from './dbClient/readEmailBodies';
import { writeHeadersToFs, writeTemplatesToFs } from './writeFromDbToFs';
import { readHeaderFromFs } from "./fsClient/readHeaderFromFs";
import {readBodyFromFs} from "./fsClient/readBodyFromFs";

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getEmailHeaders() {
    return await getEmailHeaders();
  }

  async getEmailTemplates() {
    return await getEmailTemplates();
  }

  async extractEmailData() {
    const headers = await getEmailHeaders();
    const templates = await getEmailTemplates();

    writeHeadersToFs(headers);
    writeTemplatesToFs(templates);

    return headers;
  }

  getHeaderFromFile(id) {
    return readHeaderFromFs(id);
  }

  getBodyFromFile(id) {
    return readBodyFromFs(id);
  }
}
