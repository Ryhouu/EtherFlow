import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/system';

const darkLogos = [
  { name: 'Next.js', link: 'next.svg' },
  { name: 'Vercel', link: 'vercel.svg' },
  { name: 'MUI', link: '/static/mui.png' },
  { name: 'Supabase', link: '/static/supabase.png' },
  { name: 'Google Cloud', link: '/static/google_cloud.png' },
  { name: 'Google Cloud', link: '/static/solidity.svg' },
];

const whiteLogos = [
  { name: 'Next.js', link: 'next.svg' },
  { name: 'Vercel', link: 'vercel.svg' },
  { name: 'MUI.js', link: '/static/mui.png' },
  { name: 'Supabase.js', link: '/static/supabase.png' },
  { name: 'Google Cloud', link: '/static/google_cloud.png' },
  { name: 'Google Cloud', link: '/static/solidity.svg' },
];

const logoStyle = {
  width: '100px',
  height: 'auto',
  margin: '0 32px',
  opacity: 0.8,
};

export default function LogoCollection() {
  const theme = useTheme();
  const logos = theme.palette.mode === 'light' ? darkLogos : whiteLogos;

  return (
    <Box id="logoCollection" sx={{ py: 4 }}>
      <Typography
        component="p"
        variant="subtitle2"
        align="center"
        color="text.secondary"
      >
        Powered by
      </Typography>
      <Grid container justifyContent="center" alignItems="center" sx={{ mt: 0.5, opacity: 0.6 }}>
        {logos.map((logo, index) => (
          <Grid item key={index}>
            <img
              src={logo.link}
              alt={logo.name}
              style={logoStyle}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
