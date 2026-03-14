import { Box, CircularProgress, Fade, Typography } from '@mui/material';

interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

export default function Loader({ fullPage = false, message }: LoaderProps) {
  if (fullPage) {
    return (
      <Fade in timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            gap: 2,
          }}
        >
          <CircularProgress size={48} thickness={3} sx={{ color: 'primary.main' }} />
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Box>
      </Fade>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, gap: 2 }}>
      <CircularProgress size={36} thickness={3} />
      {message && <Typography variant="body2" color="text.secondary">{message}</Typography>}
    </Box>
  );
}
