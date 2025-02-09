const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1) Create a transporter
  const transporter = nodemailer.createTransport({
    // service :"Gmail"
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    // secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // debug: true, // Enable debugging
    // logger: true, // Log to console
    // connectionTimeout: 10000, // Increase timeout (10s)
  });
  //2) Define the email options
  const mailOptions = {
    from: 'Admin <nazeehmaged@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  //3) Actually send the email
  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
