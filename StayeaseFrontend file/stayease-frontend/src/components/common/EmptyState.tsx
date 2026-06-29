import { Box, Button, Typography } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";

interface Props {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <SearchOffIcon sx={{ fontSize: 52, mb: 2, color: "primary.main" }} />
      <Typography variant="h6" mb={1}>
        {title}
      </Typography>
      <Typography mb={3}>{description}</Typography>
      {actionLabel && <Button variant="contained" onClick={onAction}>{actionLabel}</Button>}
    </Box>
  );
}