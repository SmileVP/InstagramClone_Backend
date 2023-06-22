const nodemailer = require("nodemailer");
require("dotenv").config;

const passwordEmail = async ({ email, fullName, message }) => {
  let mailTranspoter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER,
      pass: process.env.PASSWORD,
    },
  });

  let details = {
    from: process.env.USER,
    to: `${email}`,
    subject: "Instagram Reset password",
    html: ` <div style="background-color: antiquewhite; margin-left:25%; margin-right:25%; padding:20px;">
      <div>
        <b>Hello ${fullName},</b>
      </div>
      <br>
      <br>
      <div>
        Link will be expires in 10m - ${message}
      </div>
      <br>
      <footer style="text-align: center;">
        <b>Thank you</b>
      </footer>
    </div>`,
  };

  mailTranspoter.sendMail(details, (err, data) => {
    if (err) {
      console.log("Error" + err);
    } else {
      console.log("Email send");
    }
  });
};

module.exports = { passwordEmail };
