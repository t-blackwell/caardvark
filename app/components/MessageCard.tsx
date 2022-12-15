import DeleteIcon from "@mui/icons-material/Delete";
import {
  Card,
  CardContent,
  CardHeader,
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
    <Card
      variant="outlined"
      key={message.message_id}
      className="ViewCard__message"
    >
      <div className="ViewCard__messageTitleContainer">
        <CardHeader
          title={`From: ${message.from}`}
          action={
            isOwner ? (
              <Form method="post">
                <IconButton type="submit" name="_action" value="delete">
                  <input
                    type="hidden"
                    name="messageId"
                    value={message.message_id}
                  />
                  <DeleteIcon />
                </IconButton>
              </Form>
            ) : (
              <></>
            )
          }
        />
      </div>
      <CardContent>
        <Typography
          color={message.color.hex ?? undefined}
          fontFamily={message.font.name ?? undefined}
        >
          {message.text}
        </Typography>
      </CardContent>
      {message.image_url !== null ? (
        <CardMedia
          component="img"
          src={message.image_url}
          alt="message image"
        />
      ) : null}
    </Card>
  );
}
