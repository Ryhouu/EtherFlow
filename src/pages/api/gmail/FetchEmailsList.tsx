import { google } from 'googleapis';
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    if (!session) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    const accessToken = session?.accessToken as string;

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
        const response = await gmail.users.messages.list({ 
            userId: 'me',
            maxResults: 20
        });
        console.log(response.data); 
        res.status(200).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json(error);
    }
}

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const session = await getSession({ req });
//     const accessToken = session?.accessToken as string;

//     if (!accessToken) {
//         return res.status(401).json({ error: "Unauthorized" });
//     }

//     const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20`, {
//         headers: {
//             Authorization: `Bearer ${accessToken}`,
//             'Accept': 'application/json'
//         }
//     });

//     const data = await response.json();
//     res.status(200).json(data);
// }