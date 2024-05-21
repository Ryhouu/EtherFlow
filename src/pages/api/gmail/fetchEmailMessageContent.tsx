import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession({ req });
    const accessToken = session?.accessToken as string;

    if (!accessToken) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { messageId } = req.query;

    if (!messageId) {
        return res.status(400).json({ error: "Message ID not found" });
    }

    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    const emailDetails = await response.json();
    if (!response.ok) {
        return res.status(response.status).json(emailDetails);
    }

    res.status(200).json(emailDetails);
}
