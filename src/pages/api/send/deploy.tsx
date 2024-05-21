import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import Web3 from 'web3';

const web3 = new Web3;
let contractAbi: any;
let contractBytecode: any;

export default function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    const { recipient, expiration } = req.body;
    console.log("Received recipient:", recipient, "and expiration:", expiration);

    try {
        const encodedParameters = web3.eth.abi.encodeParameters(
          ['address', 'int'],
          [recipient, expiration]
        ).slice(2);
  
        const contractPath = path.resolve(process.cwd(), 'contracts', 'PaymentChannel.sol');
        const source = fs.readFileSync(contractPath, 'utf8');
    
        const toCompile = {
          language: 'Solidity',
          sources: { 'PaymentChannel.sol': { content: source } },
          settings: { outputSelection: { '*': { '*': ['*'] } } }
        };
        const output = JSON.parse(solc.compile(JSON.stringify(toCompile)));
    
        const contract = 'PaymentChannel';
        contractAbi = output.contracts['PaymentChannel.sol'][contract].abi;
        contractBytecode = output.contracts['PaymentChannel.sol'][contract].evm.bytecode.object + encodedParameters;  

        // console.log("contract abi:", contractAbi)
        // console.log("contract bytecode:", contractBytecode)
  
        console.log("success")
      } catch (error) {
        console.error("Error in POST function:", error);
      }

      res.status(200).json(
        {
          message: "Success",
          contractAbi: contractAbi,
          contractBytecode: contractBytecode 
        }
      )
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
