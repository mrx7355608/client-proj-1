import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage({
  to,
  message,
  subject,
  agreementPdf,
  cc,
  bcc,
}: {
  cc?: string[];
  bcc?: string[];
  to: string;
  message: string;
  subject: string;
  agreementPdf?: File;
}) {
  // FIXME: the mailgun api key should not be public!!!
  const apiKey = import.meta.env.VITE_MAILGUN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Mailgun api key is missing. Please define MAILGUN_API_KEY in your .env",
    );
  }

  const emailSender = import.meta.env.VITE_EMAIL_SENDER;
  if (!emailSender) {
    throw new Error(
      "No email sender has been defined, please add VITE_EMAIL_SENDER to your .env file. See .example.env for more info",
    );
  }

  // Show warning if email domain is not specified
  if (!import.meta.env.VITE_EMAIL_DOMAIN) {
    console.log(
      "[WARNING] No Email Domain is specified. Using mailgun domain as fallback",
    );
  }

  try {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: apiKey,
    });
    let mailData = {
      from: emailSender,
      to: [to],
      cc: cc || [],
      bcc: bcc || [],
      subject: subject,
      text: message,
    };

    if (agreementPdf) {
      mailData = { ...mailData, attachment: agreementPdf };
    }

    // Setup domain
    const mailgunDomain = "sandbox9cbe43c569f34153b8efc76c9d298927.mailgun.org";
    const domain = import.meta.env.VITE_EMAIL_DOMAIN || mailgunDomain;

    // Send email
    const data = await mg.messages.create(domain, mailData);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
