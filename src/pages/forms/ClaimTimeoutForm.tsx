


import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";

import * as React from 'react';
import TextField from '@mui/material/TextField';
import { ethers } from "ethers";
import { PaymentChannelDataSchema } from "@/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/src/utils/toast";
import { getContractExpiration } from "../../../contracts/utils";
import { AccountDataSchema } from "@/src/components/schema/AccountDataSchema";
import { PaymentChannelABI } from "../../../contracts/PaymentChannel-abi";
import VerticalLinearStepper, { StepItem } from "@/src/components/share/VerticalLinearStepper";
import CodeBlock from "@/src/components/share/CodeBlock";


const BasicInfoStepForm = ({
    isConnected,
    data,
    onChange,
    provider
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
    provider: ethers.BrowserProvider
}) => {
    const [verifyContractStatus, setVerifyContractStatus] = React.useState<number>(0)
    const [verifyContractAlertMsg, setVerifyContractAlertMsg] = React.useState<string>('')

    const verifyContractAlertSeverity = React.useMemo(() => {
        switch (verifyContractStatus) {
            case 200: { 
                return 'success' 
            }
            case 400:
            case 404:
            case 405: {
                return 'warning'
            } 

            default: {
                return 'error'
            }
        }
    }, [verifyContractStatus])

    React.useEffect(() => {
        const fetchData = async () => {
            const contractAddress = data.contractAddress ? data.contractAddress : '';

            const verifyContractResult = await fetchWithToast(`/api/contract/verify-contract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    contractAddress: contractAddress,
                })
            })

            if (verifyContractResult) {
                setVerifyContractStatus(verifyContractResult.status)
                const resJson = await verifyContractResult.json()
                setVerifyContractAlertMsg(resJson.message)
            }
            
            if (verifyContractResult.ok) {
                try {
                    const expirationUnix = await getContractExpiration({ provider, contractAddress });
                    if (expirationUnix) {
                        const expirationUnixInt = Number(expirationUnix) * 1000; 
                        onChange({ 
                            isVerified: true,
                            expirationDate: new Date(expirationUnixInt) 
                        });
                    }
                    console.log(data.expirationDate)
                } catch (error) {
                    console.error('Error fetching contract expiration:', error);
                }
            }
        };
    
        if (data.contractAddress) {
            fetchData();
        }
    }, [data.contractAddress]) 

    React.useEffect(() => {
        console.log("New expiration:", data.expirationDate)
        console.log("isVerified, ", data.isVerified)
    }, [data.expirationDate, data.isVerified])

        
    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
    <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap flexWrap="wrap">
        <TextField
            required
            id="standard-contract-address"
            label="Contract Address"
            variant="standard"
            value={data.contractAddress}
            onChange={(e) => { onChange({ contractAddress: e.target.value }) }}
        />

        {
            data.isVerified &&
            <Alert severity={verifyContractAlertSeverity} sx={{ width: "60ch"}}> 
                { verifyContractAlertMsg.toString() }
            </Alert>
        }
        {
            data.expirationDate &&
            <Alert severity="info" sx={{ width: "60ch"}}> 
                {"The current expiration is: " +
                    data.expirationDate?.toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
                }
            </Alert>
        }
    </Stack>
    </Box>
    )
}

export default function ClaimTimeoutForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
}) {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [contractData, setContractData] = useState<Partial<PaymentChannelDataSchema>>({
        contractAddress: '',
        senderAddress: '',
        isDeployed: false,
        isVerified: false
    })
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionSuccess, setTransactionSuccess] = useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined' && window.ethereum) {
            const newProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(newProvider);
        }
        if (data && data.account) {
            setContractData(prevData => ({
                ...prevData,
                senderAddress: data.account
            }));
        }
    }, []);
    
    const props = {
        isConnected: isConnected,
        data: contractData, 
        onChange: (data: Partial<PaymentChannelDataSchema>) => {
            setContractData({ ...contractData, ...data })
        }
    }

    const handleSubmit = async() => {
        if (!provider) return;

        setIsProcessing(true); 
        setTransactionSuccess(false);

        const contractAddress = contractData.contractAddress ? contractData.contractAddress : '';
        const balance = await provider.getBalance(contractAddress);
        if (balance) {
            setContractData({ ...contractData, balance: Number(balance) / 1000000000000000000 }) // wei to eth
        }

        const contract = new ethers.Contract(
            contractAddress, 
            PaymentChannelABI, 
            await provider.getSigner()
        );
        
        try {
            const transaction = await contract.claimTimeout();

            provider.waitForTransaction(transaction['hash']).then(
                async (TxReceipt: ethers.TransactionReceipt | null) => {
                    console.log("claimTimeout - TxReceipt", TxReceipt)
    
                if (TxReceipt && TxReceipt.status) {
                    setTransactionSuccess(true);
                } 
                
                setIsProcessing(false);
            }).catch((error) => {
                console.log('error', error);
                setIsProcessing(false);
                setTransactionSuccess(false);
            });
        } catch (error) {
            console.log(error)
            setIsProcessing(false);
            setTransactionSuccess(false);
        }
    }

    const steps: StepItem[] = provider ? [
        {
          label: 'Basic Info',
          description: `Fill in the contract address to claim timeout.`,
          children: <BasicInfoStepForm {...props} provider={provider} />,
          continueLabel: 'Claim',
          handleNext: handleSubmit
        },
    ] : [];

    return (
        <Box>
            <VerticalLinearStepper 
            steps={steps} 
            completedChildren={
                <Box>
                {
                    isProcessing && 
                    <CircularProgress color="inherit" />
                }
                {
                    transactionSuccess &&
                    <Box>
                        <Alert
                            severity="success"
                            sx={{ width: '100%' }}
                        >
                            <Typography>
                                Claim timeout successful.
                            </Typography>
                            <Typography>
                                Returned { contractData.balance } ETH to this account.
                            </Typography>
                            <CodeBlock 
                                code={contractData.contractAddress ? contractData.contractAddress : ''} 
                                label='Contract Address'
                            />
                        </Alert>
                    </Box>
                }
                {
                    !isProcessing && !transactionSuccess &&
                    <Alert
                        severity="error"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Claim timeout failed.</Typography>
                        <Typography>Please try again.</Typography>
                    </Alert>
                }
                </Box>
            }
            />
        </Box>
    )
    
}

