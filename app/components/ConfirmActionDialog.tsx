import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";

interface ConfirmActionDialogProps {
  actionName: string;
  isOpen: boolean;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmActionDialog({
  actionName,
  isOpen,
  message,
  onClose,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={isOpen} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm {actionName}</DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={onClose}>
          Cancel
        </Button>
        <Button color="secondary" variant="contained" onClick={onConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
