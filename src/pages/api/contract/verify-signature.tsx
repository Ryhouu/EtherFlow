import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySignature, VerifySignatureSchema } from './VerifySignature';


export default function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    // const { contractAddress, amount } = req.body;
    // console.log("Received contract address:", contractAddress, ", and amount:", amount);

    try {
        const isValidSignature = verifySignature(req.body)

        return res.status(201).json(
            { 
              message: "Success", 
              isValidSignature: isValidSignature
            }
        )
    } catch (error) {
        console.error("Error in POST function:", error);
        return res.status(500).json({ message: "Internal Server Error : (" })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
