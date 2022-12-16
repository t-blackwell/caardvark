import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

interface ConfirmActionDialogProps {
  actionName: string;
  actionColorTheme:
    | "error"
    | "inherit"
    | "info"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | undefined;
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionDialog({
  actionName,
  actionColorTheme,
  isOpen,
  message,
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth>
      <Box position="absolute" top={0} right={0}>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color={actionColorTheme}
          variant="contained"
          onClick={onConfirm}
        >
          {actionName}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
