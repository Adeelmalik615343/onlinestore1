require("dotenv").config();
const transporter = require("./config/email");

async function testEmail() {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // send to self for test
      subject: "Test Email",
      text: "This is a test email to check if email functionality is working."
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Test email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending test email:", error);
  }
}

testEmail();