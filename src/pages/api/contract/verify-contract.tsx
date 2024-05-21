import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';

const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/v2/N6jbViZYGzI-M8RUFCcFT3GirYmP6pid'
const provider = new ethers.JsonRpcProvider(alchemyUrl);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const { contractAddress, } = req.body;
    console.log("Received contract address:", contractAddress);

    try {
        const getCode = await provider.getCode(contractAddress);
        const getBalance = await provider.getBalance(contractAddress);

        const emptyCode = '0x';
        const bytecodePath = path.resolve(process.cwd(), 'contracts', 'PaymentChannel.bytecode');
        const bytecode = fs.readFileSync(bytecodePath, 'utf8');
        
        if (getCode === emptyCode) {
            res.status(404).json({ message: "Payment channel does not exist." })
        } else if (getBalance === BigInt(0)) {
            res.status(400).json({ message: "Payment channel escrowed 0 ETH or closed." })
        } else if (getCode !== bytecode) {
            res.status(405).json({ message: "Payment channel has been altered." })
        }
        return res.status(200).json({ message: "Payment channel verified!" })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error." })
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
