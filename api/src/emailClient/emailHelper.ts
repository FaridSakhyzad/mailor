import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

config();

const transport = createTransport({
  service: 'hotmail',
  auth: {
    user: 'farid.sakhyzad@hotmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async (htmlData, receivers) => {
  console.log('Sending Email.');

  console.log(receivers);

  const info = await transport
    .sendMail({
      from: 'farid.sakhyzad@hotmail.com', // sender address
      to: receivers,
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: htmlData, // html body
    })
    .catch((err) => {
      console.log('Error: ', err);

      return {
        error: err,
      };
    });

  console.log('Email Sent.');
  return info;
};
