import type { NextApiRequest, NextApiResponse } from 'next';
import abi from 'ethereumjs-abi'


export default function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const { contractAddress, amount } = req.body;
    console.log("Received contract address:", contractAddress, ", and amount:", amount);

    try {
        const paymentMessage = abi.soliditySHA3(
            ['address', 'uint256'],
            [contractAddress, amount]
        ).toString('hex')
  
        res.status(200).json({
            message: "Success",
            paymentMessage: paymentMessage
        });
    } catch (error) {
        console.error("Error in POST function:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
