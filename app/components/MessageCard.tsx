import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from "@mui/material";
import { Form } from "@remix-run/react";

interface MessageCardProps {
  message: any;
  isOwner: boolean;
}

export default function MessageCard({ message, isOwner }: MessageCardProps) {
  return (
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
          <Form method="post">
            <input type="hidden" name="messageId" value={message.message_id} />
            <IconButton
              name="_action"
              type="submit"
              value="delete"
              size="small"
            >
              <DeleteIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Form>
        ) : null}
      </CardActions>
    </Card>
  );
}
