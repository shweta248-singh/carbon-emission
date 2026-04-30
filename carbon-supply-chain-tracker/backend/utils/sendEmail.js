const sgMail = require('@sendgrid/mail');

/**
 * Send an email using SendGrid
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  // Set API Key
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.email,
    from: process.env.EMAIL_FROM,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`Email sent successfully to ${options.email}. Message ID: ${response[0].headers['x-message-id']}`);
    return { success: true };
  } catch (error) {
    // Detailed safe logging
    console.error('--- SendGrid Email Error ---');
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.response && error.response.body) {
      console.error('Response Body:', JSON.stringify(error.response.body, null, 2));
    }
    
    // We do NOT log process.env.SENDGRID_API_KEY here to keep it safe.
    console.error('----------------------------');

    // Throw error to be handled by the caller if needed, 
    // but include the error details for development troubleshooting
    throw error;
  }
};

module.exports = sendEmail;
