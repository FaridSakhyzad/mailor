import { createTransport } from 'nodemailer';

const transport = createTransport({
  service: 'hotmail',
  auth: {
    user: 'farid.sakhyzad@hotmail.com',
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendMail = async (htmlData) => {
  const info = await transport.sendMail({
    from: 'farid.sakhyzad@hotmail.com', // sender address
    to: 'buterbread@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world?', // plain text body
    html: htmlData, // html body
  });

  return `Message sent: ${info.messageId}`;
};
