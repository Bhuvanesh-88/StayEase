import { Box } from "@mui/material";
import type { ReactNode } from "react";
import AppHeader from "./AppHeader";
import Footer from "./Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}