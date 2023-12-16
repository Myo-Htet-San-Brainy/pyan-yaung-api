const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendPasswordReset = async (name, email, passwordResetToken, origin) => {
  const resetPassword = `${origin}/user/want-to-reset-password?rsuEmail=${email}&token=${passwordResetToken}`;
  const body = `<h4>Hello ${name},</h4><p>Please click on the following link within 10 minutes to reset your password: <a href= ${resetPassword}>Reset Password</a></p>`;
  const msg = {
    to: email, // Change to your recipient
    from: "myohtetsandrinksmilk@gmail.com", // Change to your verified sender
    subject: "21days Password Reset",
    html: body,
  };
  await sgMail.send(msg);
};

module.exports = sendPasswordReset;
