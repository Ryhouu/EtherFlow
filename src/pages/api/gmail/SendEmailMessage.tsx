import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions); // server side
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const accessToken = session.accessToken as string;
  const { to, subject, body } = req.body;

  console.log("Email details:", to, subject, body)

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const email = createEmail(to, subject, body);

  try {
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: email
      }
    });
    console.log(response.data); 
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to send email' });
  }
}

function createEmail(to: string, subject: string, message: string) {
  const str = `Content-Type: text/plain; charset="UTF-8"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 7bit\nto: ${to}\nsubject: ${subject}\n\n${message}`;
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}
