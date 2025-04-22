import FormData from "form-data"; // form-data v4.0.1
import Mailgun from "mailgun.js"; // mailgun.js v11.1.0

export async function sendSimpleMessage({
  to,
  message,
  subject,
  agreementPdf,
}: {
  to: string;
  message: string;
  subject: string;
  agreementPdf: File;
}) {
  // FIXME: the mailgun api key should not be public!!!
  const apiKey = import.meta.env.VITE_MAILGUN_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Mailgun api key is missing. Please define MAILGUN_API_KEY in your .env",
    );
  }

  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: apiKey,
  });
  try {
    // TODO: add an email template
    const data = await mg.messages.create(
      "sandbox9cbe43c569f34153b8efc76c9d298927.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandbox9cbe43c569f34153b8efc76c9d298927.mailgun.org>",
        to: [to],
        subject: subject,
        text: message,
        attachment: agreementPdf,
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}
