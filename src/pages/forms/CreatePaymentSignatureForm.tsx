

import { Alert, Box, Button, ButtonGroup, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, FormControlLabel, FormGroup, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Tooltip, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";

import * as React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';

import { ethers } from 'ethers'
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { useSession, signIn } from "next-auth/react";
import { ChannelStatus, PaymentChannelDataSchema } from "@/src/components/schema/PaymentChannelDataSchema";
import { convertETHtoWei, getContractExpiration } from "../../../contracts/utils";
import { AccountDataSchema } from "@/src/components/schema/AccountDataSchema";
import { fetchWithToast } from "@/src/utils/toast";
import VerticalLinearStepper, { StepItem } from "@/src/components/share/VerticalLinearStepper";
import CodeBlock from "@/src/components/share/CodeBlock";


const BasicInfoStepForm = ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
}) => {
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
            onChange={(e) => onChange({ contractAddress: e.target.value })}
        />

        <TextField
            required
            id="standard-amount"
            label="Amount"
            type="number"
            InputProps={{
                endAdornment: <InputAdornment position="start">ETH</InputAdornment>,
            }}
            variant="standard"
            value={data.escrowAmount}
            onChange={(e) => {
                const escrowAmount = parseFloat(e.target.value)
                const escrowAmountWei = convertETHtoWei(escrowAmount)
                onChange({ 
                    escrowAmount: escrowAmount,
                    escrowAmountWei: escrowAmountWei 
                })
            }}
        />
    </Stack>
    </Box>
    )
}

const OptionsStepForm = ({
    isConnected,
    data,
    onChange,
    setLogSignature,
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
    setLogSignature: (value: boolean) => void,
}) => {
    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
        <FormGroup>
        <FormControlLabel control={<Checkbox />} label="This is a final payment." />
        <FormControlLabel 
            control={<Checkbox defaultChecked onChange={(e) => {setLogSignature(e.target.checked)}} />} 
            label="Log this signature." />
        </FormGroup>
    </Box>
    )
}

export default function CreatePaymentSignatureForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
}) {
    const [contractData, setContractData] = useState<Partial<PaymentChannelDataSchema>>({
        senderAddress: data.account,
        isVerified: false
    })
    const props = {
        isConnected: isConnected,
        data: contractData, 
        onChange: (data: Partial<PaymentChannelDataSchema>) => {
            setContractData({ ...contractData, ...data })
        }
    }
    const [isSigning, setIsSigning] = useState(false);
    const [signSuccess, setSignSuccess] = useState(false);
    const [logSignature, setLogSignature] = useState(true);
    const [logSuccess, setLogSuccess] = useState(false);

    const handleSubmit = async() => {
        setIsSigning(true); 
        setSignSuccess(false);
        console.log("Handle Submit - SignPayment, data: ", data)

        const res = await fetchWithToast(`/api/send/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: contractData.contractAddress,
                amount: contractData.escrowAmountWei?.toString()
            })
        })

        if (!res.ok) return

        const resData = await res.json()

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [
                '0x' + resData['paymentMessage'],
                contractData.senderAddress
            ]
        })

        if (signature) {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const contractAddress = contractData.contractAddress ? contractData.contractAddress : ''
            const expirationUnix = await getContractExpiration({ provider, contractAddress });

            if (expirationUnix) {
                const expirationUnixInt = Number(expirationUnix) * 1000
                setContractData({ 
                    ...contractData,
                    signature: signature, 
                    message: resData['paymentMessage'],
                    expirationDate: new Date(expirationUnixInt)
                })
            }
            else {
                console.error("Fail to get expirationUnix.")
                setContractData({ 
                    ...contractData,
                    signature: signature, 
                    message: resData['paymentMessage'] 
                })
            }
            setIsSigning(false)
            setSignSuccess(true)
        }
        else {
            setIsSigning(false);
        }
    }

    const handleLog = async() => {
        if (logSignature && signSuccess) {
            console.log("Logging Contract: ", contractData)

            const req = await fetchWithToast(`/api/log/payment-signatures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    created_at: (new Date()).toISOString(),
                    account: data.account,
                    contractAddress: contractData.contractAddress,
                    signer: data.account,
                    amount: contractData.escrowAmount,
                    signature: contractData.signature,
                    expiration: contractData.expirationDate ? contractData.expirationDate.toISOString() : null,
                    status: ChannelStatus.Open, // TODO
                })
            })
            if (req.status == 200) {
                setLogSuccess(true)
            }
            else {
                setLogSuccess(false)
            }
        }
    }

    React.useEffect(() => {
        if (signSuccess && logSignature) {
            handleLog()
        }
    }, [logSignature, signSuccess])

    React.useEffect(() => {
        console.log("updated logSuccess", logSuccess)
    }, [logSuccess])

    const steps: StepItem[] = [
        {
          label: 'Basic Info',
          description: `Fill in the required fields to get your signature.`,
          children: <BasicInfoStepForm {...props} />,
          continueLabel: null,
          handleNext: () => {}
        },
        {
          label: 'Options',
          description: `Select Options.`,
          children: <OptionsStepForm {...props} setLogSignature={setLogSignature}/>,
          continueLabel: "Sign",
          handleNext: handleSubmit
        },
    ];



    const { data: session, status } = useSession();
    const [emailDetails, setEmailDetails] = useState({
        to: '',
        subject: '',
        body: ''
    });

    console.log("[Sending] Session:", session);
    console.log("[Sending] Session status:", status);


    const [openDial, setOpenDial] = React.useState(false);
    const handleOpenDial = () => setOpenDial(true);
    const handleCloseDial = () => setOpenDial(false);
    const [openShareFormDialog, setOpenShareFormDialog] = React.useState(false);

    const actions = [
        { icon: <FileCopyIcon />, name: 'Copy', onClick: () => {} },
        { icon: <SaveIcon />, name: 'Save', onClick: () => {} },
        { icon: <PrintIcon />, name: 'Print', onClick: () => {} },
        { 
            icon: <ShareIcon />, 
            name: 'Share', 
            onClick: () => {
                setOpenShareFormDialog(true)
            }  
        },
    ];

    const handleShare = async() => {
        if (!session) {
            signIn();
            return;
        }

        setEmailDetails(value => ({
            ...value,
            subject: "Claim Your Payment",
            body: `Here is your payment details: \nContract Address: ${contractData.contractAddress} \nSignature: ${contractData.signature} \nMessage: ${contractData.message} \nSender Address: ${contractData.senderAddress}`
        }))
    
        const res = await fetchWithToast('/api/gmail/SendEmailMessage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(emailDetails)
        });

        const data = await res.json();
        if (res.ok) {
            console.log(data)
            alert('Email sent successfully!');
        } else {
            alert('Failed to send email.');
        }
    }
    
    return (
        <VerticalLinearStepper 
            steps={steps} 
            completedChildren={
                <Box>
                {
                    isSigning && 
                    <CircularProgress color="inherit" />
                }
                {
                    signSuccess &&
                    <Box sx={{
                        marginTop: "1ch"
                    }}>
                        <CodeBlock code={contractData.message ? contractData.message : ''} label={"Message"} />
                        <Divider sx={{ marginTop: "1ch" }} />
                        <CodeBlock code={contractData.signature ? contractData.signature : ''} label={"Signature"} />
                        <FormGroup>
                        </FormGroup>

                        <Dialog
                            open={openShareFormDialog}
                            onClose={() => {setOpenShareFormDialog(false)}}
                            PaperProps={{
                            component: 'form',
                            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                                event.preventDefault();
                                const formData = new FormData(event.currentTarget);
                                const formJson = Object.fromEntries((formData as any).entries());
                                const email = formJson.email;
                                console.log(email);
                                setOpenShareFormDialog(false)
                            },
                            }}
                        >
                            <DialogTitle>Share</DialogTitle>
                            <DialogContent>
                            <DialogContentText>
                                To share to this signed signature, please enter the recipient email address here and grant us access to help you send an email. 
                            </DialogContentText>
                            {/* <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="name"
                                name="email"
                                label="Your Email Address"
                                type="email"
                                fullWidth
                                variant="standard"
                            /> */}
                            <TextField
                                autoFocus
                                required
                                margin="dense"
                                id="name"
                                name="email"
                                label="Recipient Email Address"
                                type="email"
                                fullWidth
                                variant="standard"
                                onChange={(e) => {
                                    setEmailDetails(value => ({ ...value, to: e.target.value}))
                                }}
                            />
                            </DialogContent>
                            <DialogActions>
                            <Button onClick={() => {setOpenShareFormDialog(false)}}>Cancel</Button>
                            <Button onClick={handleShare}>Share</Button>
                            </DialogActions>
                        </Dialog>

                        <SpeedDial
                            ariaLabel="SpeedDial tooltip example"
                            sx={{ position: 'relative', top: 9, right: 5 }}
                            icon={<SpeedDialIcon />}
                            direction="left"
                            onClose={handleCloseDial}
                            onOpen={handleOpenDial}
                            open={openDial}
                        >
                            {actions.map((action) => (
                            <SpeedDialAction
                                key={action.name}
                                icon={action.icon}
                                tooltipTitle={action.name}
                                // tooltipOpen
                                onClick={action.onClick}
                            />
                            ))}
                        </SpeedDial>
                    </Box>
                }
 
                {
                    logSuccess &&
                    <Alert
                        severity="success"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Your signature has been successfully logged.</Typography>
                        <Typography>You can check it at Account settings - My Signatures.</Typography>
                    </Alert>
                }
                {
                    !isSigning && !logSuccess &&
                    <Alert
                        severity="error"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>We cannot log your signature at this point.</Typography>
                        <Typography>Please report this issue.</Typography>
                    </Alert>
                }
                </Box>
            }
        />
    )
}




