const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (
  name,
  email,
  verificationToken,
  origin
) => {
  const verifyEmail = `${origin}/verify?email=${email}&token=${verificationToken}`;
  const body = `<h4>Hello ${name},</h4><p>Please verify your 21days email by clicking on the following link: <a href= ${verifyEmail}>Verify Email</a></p>`;
  const msg = {
    to: email, // Change to your recipient
    from: "myohtetsandrinksmilk@gmail.com", // Change to your verified sender
    subject: "21days Email Verification",
    html: body,
  };
  await sgMail.send(msg);
};

module.exports = sendVerificationEmail;
