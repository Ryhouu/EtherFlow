import { ethers } from 'ethers'
// import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';
import axios from 'axios';

export async function getContractExpiration({
    provider, 
    contractAddress,
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string
}) {
    console.log("Getting expiration for contract", contractAddress)
    const contractExpiration = new ethers.Contract(
        contractAddress,
        ['function expiration() public view returns (uint256)'],
        provider
    );
    return contractExpiration.expiration();
}

export async function verifySignerIsSender({
    provider, 
    contractAddress, 
    signer
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string,
    signer: string
}) {
    const contractSender = new ethers.Contract(
        contractAddress,
        ['function sender() public view returns (address)'],
        provider
    );
    const sender = await contractSender.sender();
    if (signer.toLowerCase() === sender.toLowerCase()) {
        return true;
    }
    return false;
}

export async function getContractRecipient({
    provider, 
    contractAddress,
}: {
    provider: ethers.BrowserProvider,
    contractAddress: string
}) {
    const contractRecipient = new ethers.Contract(
        contractAddress,
        ['function recipient() public view returns (address)'],
        provider
    );
    return contractRecipient.recipient();
}

export function convertETHtoWei(amountETH: number) {
    return amountETH * 1000000000000000000;
}


interface EtherscanApiResponse {
    status: string;
    message: string;
    result: string;  // Balance in wei as a string to handle large numbers safely
}

export async function getEthBalance ({
    contractAddress,
    etherscanApiKey
}:{
    contractAddress: string,
    etherscanApiKey: string
}) {
    console.log("Getting Eth Balance");
    console.log(`Api Key: ${etherscanApiKey}`)

    const url: string = `https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${contractAddress}&tag=latest&apikey=${etherscanApiKey}`;

    try {
        const response = await axios.get<EtherscanApiResponse>(url);
        const balanceWei: string = response.data.result; // Balance is returned in wei
        const balanceEth: number = Number(balanceWei) / 1e18; // Convert wei to ETH

        console.log(`Balance: ${balanceWei} wei`);
        console.log(`Balance in ETH: ${balanceEth} ETH`);
        return balanceEth;
    } catch (error) {
        console.error('Error fetching balance:', error);
        return -1;
    }
};


