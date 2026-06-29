import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box sx={{ py: 3, borderTop: "1px solid #e5e7eb", bgcolor: "white", mt: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          2026 StayEase. Smart accommodation booking platform.
        </Typography>
      </Container>
    </Box>
  );
}