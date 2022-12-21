import { Box, Button, Dialog, TextField, Typography } from "@mui/material";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import RichTextEditor from "~/components/RichTextEditor";
import type { Color, FontFamily } from "~/components/RichTextEditor";

interface AddMessageDialogProps {
  cardHash: string;
  cardId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddMessageDialog({
  cardHash,
  cardId,
  isOpen,
  onClose,
}: AddMessageDialogProps) {
  const errors = useActionData();

  const [imageUrl, setImageUrl] = React.useState<string>();
  const [color, setColor] = React.useState<Color>("#000");
  const [fontFamily, setFontFamily] = React.useState<FontFamily>("Arial");

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="AddMessage__dialog"
      fullWidth
      maxWidth="xs"
    >
      <Form className="AddMessage__box" method="post">
        <Typography className="AddMessage__title" variant="h5">
          Add Message
        </Typography>

        <input name="font" value={fontFamily} hidden />
        <input name="color" value={color} hidden />

        <RichTextEditor
          autoFocus
          color={color}
          fontFamily={fontFamily}
          fullWidth
          name="text"
          placeholder="Start typing message..."
          required
          setColor={setColor}
          setFontFamily={setFontFamily}
        />
        {errors?.text !== undefined ? (
          <Typography className="AddMessage__inlineError" variant="caption">
            {errors.text}
          </Typography>
        ) : undefined}
        <TextField
          className="AddMessage__input"
          id="imageUrl"
          label="Image URL"
          name="imageUrl"
          size="small"
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl !== undefined ? (
          <Box
            className="AddMessage__imageBox"
            component="img"
            src={imageUrl}
          />
        ) : null}
        <TextField
          className="AddMessage__input"
          error={errors?.from !== undefined}
          helperText={errors?.from}
          id="from"
          label="From"
          name="from"
          required
          size="small"
        />
        <input type="hidden" name="hash" value={cardHash} />
        <input type="hidden" name="card_id" value={cardId} />
        <Button
          color="primary"
          className="AddMessage__button"
          variant="contained"
          type="submit"
          name="_action"
          value="add"
        >
          Add message
        </Button>
      </Form>
    </Dialog>
  );
}
