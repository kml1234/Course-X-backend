const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    // send email
    // console.log("kamal in mailsender");
    
    let info = await transporter.sendMail({
      from: `Course-X|| H&M - by Kamal`,
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    
    return info;
  } catch (error) {
    // console.log("Mail not Sent:", error);
  }
};
module.exports = mailSender;
