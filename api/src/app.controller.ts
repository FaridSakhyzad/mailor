import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { writeTemplateFileToDb } from './dbClient/writeEmailBody';
import {writeHeaderFileToDb} from "./dbClient/writeHeader";
import { sendMail } from './emailClient/emailHelper';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/emailHeaders')
  async getEmailHeaders() {
    return await this.appService.getEmailHeaders();
  }

  @Get('/emailHeaderFile/:id')
  getEmailHeaderFile(@Param('id') id) {
    return this.appService.getHeaderFromFile(id);
  }

  @Get('/emailBodyFile/:id')
  getEmailBodyFile(@Param('id') id) {
    return this.appService.getBodyFromFile(id);
  }

  @Get('/emailBodies')
  async getEmailTemplates() {
    return await this.appService.getEmailTemplates();
  }

  @Post('/extractEmailData')
  async extractEmailData() {
    return await this.appService.extractEmailData();
  }

  @Post('/publishTemplate')
  async writeTemplateToDb(@Body() { id }) {
    await writeTemplateFileToDb(id);

    return true;
  }

  @Post('/publishHeader')
  async writeHeaderToDb(@Body() { id }) {
    await writeHeaderFileToDb(id);

    return true;
  }

  @Post('/sendTemplate')
  async sendTemplate(@Body() { html }) {
    return await sendMail(html);
  }
}
