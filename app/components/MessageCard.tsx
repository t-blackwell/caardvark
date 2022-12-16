import ConfirmActionDialog from "./ConfirmActionDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { useFetcher } from "@remix-run/react";
import * as React from "react";

interface MessageCardProps {
  message: any;
  isOwner: boolean;
}

export default function MessageCard({ message, isOwner }: MessageCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const fetcher = useFetcher();

  const onConfirmDelete = () => {
    fetcher.submit(
      { _action: "delete", messageId: message.message_id },
      { method: "post" }
    );
    setIsOpen(false);
  };

  return (
    <fetcher.Form>
      <Card className="MessageCard" variant="outlined">
        {message.image_url !== null ? (
          <CardMedia
            component="img"
            src={message.image_url}
            alt="message image"
          />
        ) : null}
        <CardContent className="MessageCard__content">
          <Typography
            color={message.color.hex ?? undefined}
            fontFamily={message.font.name ?? undefined}
          >
            {message.text}
          </Typography>
        </CardContent>
        <CardActions className="MessageCard__actions">
          <Typography variant="caption" color="text.secondary">
            From <strong>{message.from}</strong>
          </Typography>
          {isOwner ? (
            <IconButton size="small" onClick={() => setIsOpen(true)}>
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          ) : null}
        </CardActions>
        <ConfirmActionDialog
          actionName="Delete Message"
          actionColorTheme="error"
          isOpen={isOpen}
          message={`Are you sure you want to delete the message from '${message.from}'?`}
          onClose={() => setIsOpen(false)}
          onConfirm={onConfirmDelete}
        />
      </Card>
    </fetcher.Form>
  );
}
