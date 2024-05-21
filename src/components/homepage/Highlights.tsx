import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Efficiency',
    description:
    "Capitalize on blockchain efficiency with EtherFlow, streamlining Ethereum transactions by condensing multiple applications into one seamless interface."
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Transparency',
    description:
    "EtherFlow boosts transactional transparency, allowing users to track payments and channel statuses within a unified platform."
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Secured Privacy',
    description:
    "Ensure transactional privacy and security through Ethereum's blockchain, protecting data with advanced encryption and smart contracts."
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Cost-effectiveness',
    description:
    "Reduce Ethereum transaction fees with EtherFlow's innovative payment channel that minimizes costs by consolidating fees into single operations."
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: 'User-Centric Design',
    description:
    "Experience enhanced usability with EtherFlow’s user-friendly, single-page application designed for efficiency and ease of use."
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Scalability and Future Readiness',
    description:
    "Prepare for future growth and broader adoption with EtherFlow’s scalable architecture, ready for expansion to two-way channels and mainnet integration."
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: '#06090a',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4">
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400', textAlign: 'left' }}>
            Explore why our product stands out: adaptability, durability,
            user-friendly design, and innovation. 
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400', textAlign: 'left' }}>
          Monetary transactions have been traditionally governed by centralized financial entities such as banks, including: inefficient due to intermediaries, limited transparency, high international transaction fees. To solve the problem centralized payment channels have, we introduce EtherFlow, which utilizes Blockchain and Smart Contract.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                color="inherit"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'grey.800',
                  background: 'transparent',
                  backgroundColor: 'grey.900',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography fontWeight="medium" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
