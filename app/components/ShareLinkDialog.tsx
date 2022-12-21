import { Close, ContentCopy } from "@mui/icons-material";
import type { DialogProps } from "@mui/material";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  Typography,
} from "@mui/material";
import type { card } from "@prisma/client";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import React from "react";
import { getSession, getSessionHeaders } from "~/session.server";
import { setSuccessMessage } from "~/toast-message.server";

/**
 * This function is NOT used by the component itself.
 * Since the parent route must handle the action, this function
 * provides a reusable set of behaviours for consistency between
 * routes.
 */
export async function copyLinkAction(request: ActionArgs["request"]) {
  const session = await getSession(request);
  setSuccessMessage(session, "Link copied.");
  return redirect("", {
    headers: await getSessionHeaders(session),
  });
}

interface ShareLinkDialogProps {
  hash: card["hash"];
  open: DialogProps["open"];
  onClose: () => void;
  onCopy?: () => void;
}

export default function ShareLinkDialog({
  hash,
  open,
  onClose,
  onCopy,
}: ShareLinkDialogProps) {
  const [origin, setOrigin] = React.useState<string>();
  const shareLink = `${origin}/${hash}`;

  React.useEffect(() => setOrigin(window.location.origin), []);

  const handleOnCopy = () => {
    navigator.clipboard.writeText(shareLink);
    if (onCopy !== undefined) {
      onCopy();
    }
  };

  return (
    <Dialog className="ShareLinkDialog" open={open}>
      <DialogTitle>
        Copy Link
        <IconButton className="ShareLinkDialog__closeIcon" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <div className="ShareLinkDialog__dialogContent">
          <Button className="ShareLinkDialog__linkButton">
            <Typography
              onClick={handleOnCopy}
              className="ShareLinkDialog__linkText"
            >
              {shareLink}
            </Typography>
          </Button>
          <IconButton onClick={handleOnCopy}>
            <ContentCopy />
          </IconButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
