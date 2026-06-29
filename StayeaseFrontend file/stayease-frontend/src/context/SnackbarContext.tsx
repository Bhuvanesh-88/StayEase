import { Alert, Snackbar } from "@mui/material";
import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type SnackbarSeverity = "success" | "error" | "info" | "warning";

interface SnackbarContextType {
  showMessage: (message: string, severity?: SnackbarSeverity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<SnackbarSeverity>("info");

  const showMessage = (msg: string, type: SnackbarSeverity = "info") => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const value = useMemo(() => ({ showMessage }), []);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within SnackbarProvider");
  return context;
};