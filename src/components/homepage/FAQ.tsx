import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { List, ListItem, ListItemText } from '@mui/material';

export default function FAQ() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Container
      id="faq"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Typography
        component="h2"
        variant="h4"
        color="text.primary"
        sx={{
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        Frequently asked questions
      </Typography>
      <Box sx={{ width: '100%' }}>
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1d-content"
            id="panel1d-header"
          >
            <Typography component="h3" variant="subtitle2">
              What are Decentralized finance, Blockchain, Ethereum, and Smart Contracts?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Decentralized finance - A financial system built on blockchain technology that enables peer-to-peer financial services without traditional centralized intermediaries like banks or governments.
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Blockchain - A secure, decentralized ledger that records transactions across multiple computers to ensure transparency and immutability.
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Ethereum - A blockchain platform that enables the creation and execution of smart contracts.
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Smart Contracts - Self-executing agreements embedded in blockchain code, automatically enforce contractual terms when predetermined conditions are met.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2d-content"
            id="panel2d-header"
          >
            <Typography component="h3" variant="subtitle2">
            In this context, what is a payment channel?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              A physical check requires a sender to write who they want to pay, how much they want to pay, and a signature of approval. Once this physical check is given to the intended receiver, the sender can no longer update any of those three parameters. The receiver can hold on to this physical check for a set period of time, usually determined by the financial institution, and the receiver can cash in the check anytime within that time frame. If the receiver does not cash it in within the time frame allotted, the check is void, and the sender does not lose any money. 
              <br/>
              In this context, a payment channel is like a digital check. In this digital check, the sender sets who they want to pay, and this can not be changed after it has been set. However, in this case, the sender can continuously update the payment amount of this digital check by creating new digital signatures that guarantees a certain amount set by the sender can be withdrawn by the receiver any time within an allotted time frame, which is further explained below. If the receiver does not cash it in within the time frame allotted, the digital check can be voided by the sender: i.e. the sender can take back their promised payment, which is further explained below. However, unlike most physical checks, there is a one time payment by the sender to initiate the digital check, and there is a one time payment by the receiver to withdraw from the digital check using a digital signature.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel3'}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3d-content"
            id="panel3d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to create a payment channel?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" gutterBottom>
            Sender can create a payment channel by
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Escrowing a certain amount of Sepolia Ether." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Entering the recipient’s address." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Entering an expiration." />
              </ListItem>
            </List>
            <Typography variant="body2" gutterBottom>
              Note: This action costs Sepolia Ether.
              <br />
              For the duration of this payment channel, the sender can only make cumulative payments less than or equal to the amount escrowed.
              <br></br>
              If the expiration date passes and the receiver has not claimed their payment, the sender can withdraw all the amount escrowed from a payment channel by &quot;claiming a timeout&quot;, which voids any payment signatures they sent to the receiver.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel4'}
          onChange={handleChange('panel4')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4d-content"
            id="panel4d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to create a payment signature?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" gutterBottom>
            Sender can create a payment signature by:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Entering a payment channel’s contract address." />
              </ListItem>
              <ListItem>
                <ListItemText primary="Entering the cumulative amount to promise to pay to the set recipient’s address." />
              </ListItem>
            </List>
            <Typography variant="body2" gutterBottom>
              Note: This action does not cost Sepolia Ether.
              <br />
              The payment signature, contract address, cumulative amount, and sender address should be sent to the receiver off-chain: e.g., email.
              <br />
              We can help you automatically send email to the receiver including your selected signed signatures! You can go to &quot;Account Settings&quot; at the top-right corner, and Sign In with Google first. Then, click &quot;My Signatures&quot;, select the signatures you want to send to the receiver at once, fill in their email address, and click &quot;Share&quot;.
            </Typography>
          </AccordionDetails>
        </Accordion>
        {/* <Accordion
          expanded={expanded === 'panel5'}
          onChange={handleChange('panel5')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel5d-content"
            id="panel5d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to extend a payment channel’s expiration?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Sender can extend a payment channel’s expiration by 
              <ul>
                <li>Entering a payment channel’s contract address.</li>
                <li>Entering the new expiration (must be greater than the current expiration’s Unix timestamp).</li>
              </ul>
              Note: This action costs Sepolia Ether.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel6'}
          onChange={handleChange('panel6')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel6d-content"
            id="panel6d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to claim a timeout if the expiration date has passed?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Sender can claim a timeout by 
              <ul>
                <li>Entering a payment channel’s contract address.</li>
              </ul>
              Note: This action costs Sepolia Ether.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel7'}
          onChange={handleChange('panel7')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel7d-content"
            id="panel7d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to verify a payment signature?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Receiver can verify a payment signature by 
              <ul>
                <li>Entering a payment channel’s contract address.</li>
                <li>Entering the expected payment amount.</li>
                <li>Entering the payment signature.</li>
                <li>Entering the sender’s address.</li>
              </ul>
              Note: This action does not cost Sepolia Ether.
            </Typography>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel8'}
          onChange={handleChange('panel8')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel8d-content"
            id="panel8d-header"
          >
            <Typography component="h3" variant="subtitle2">
              How to claim a payment signature?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              gutterBottom
              sx={{ maxWidth: { sm: '100%', md: '70%' } }}
            >
              Receiver can claim a payment signature by selecting from the verified signatures.
              <br></br>
              Notice that during the duration of a payment channel, a receiver will likely receive multiple payment signatures, where each successive payment signature is likely for a higher cumulative payment amount. In most cases, the receiver should cash out the payment signature with the highest cumulative payment amount.
            </Typography>
          </AccordionDetails>
        </Accordion> */}
      </Box>
    </Container>
  );
}
