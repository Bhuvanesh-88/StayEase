import Chip from "@mui/material/Chip";
import type { BookingStatus } from "../../types/models";

export default function BookingStatusChip({ status }: { status: BookingStatus }) {
  const color =
    status === "CONFIRMED"
      ? "success"
      : status === "REJECTED"
      ? "error"
      : status === "PENDING"
      ? "warning"
      : "default";

  return <Chip label={status} color={color} size="small" />;
}