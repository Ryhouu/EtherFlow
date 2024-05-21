//TODO: fix

import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';


interface RequestBody {
    contractAddress: string
}

const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/v2/N6jbViZYGzI-M8RUFCcFT3GirYmP6pid'
const provider = new ethers.JsonRpcProvider(alchemyUrl);

export async function POST (req: NextRequest) {
    try {
        const bodyJson: RequestBody = await req.json();
        console.log("POST - get expiration - Received request body:", bodyJson);

        const contractExpiration = new ethers.Contract(
            bodyJson.contractAddress,
            ['function expiration() public view returns (uint256)'],
            provider
        );

        console.log(contractExpiration.expiration())

        return NextResponse.json({ 
            message: "Success",
            // expiration: contractExpiration.expiration()
        }, { 
            status: 200 
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}