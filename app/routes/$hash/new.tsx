import FontDownloadIcon from "@mui/icons-material/FontDownload";
import SquareIcon from "@mui/icons-material/Square";
import {
  Box,
  Button,
  Container,
  createTheme,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Popover,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import type {
  ActionArgs,
  LoaderArgs,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";
import { GithubPicker } from "react-color";
import invariant from "tiny-invariant";
import { getCard } from "~/models/card.server";
import {
  createMessage,
  getColorByHex,
  getColors,
  getFontByName,
} from "~/models/message.server";
import { getFonts } from "~/models/message.server";
import { requireUserId } from "~/session.server";
import styles from "~/styles/messages/new.css";

export const loader: LoaderFunction = async ({
  request,
  params,
}: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.hash, "hash not found");

  const card = await getCard({ request, hash: params.hash });
  if (!card) {
    throw new Response("Not Found", { status: 404 });
  }
  const fontData = await getFonts();
  const colorData = await getColors();
  return json({ card, fontData, colorData });
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text")?.toString();
  invariant(text, "text not found");
  const from = formData.get("from")?.toString();
  invariant(from, "from not found");
  const hash = formData.get("hash")?.toString();
  invariant(hash, "hash not found");
  const card_id = Number(formData.get("card_id"));
  invariant(!isNaN(card_id), "card not found");
  const colorHex = formData.get("colorHex")?.toString();
  invariant(colorHex, "color not found");
  const font = formData.get("font")?.toString();
  invariant(font, "font  1 not found");
  const imageUrl = formData.get("imageUrl")?.toString();

  const errors = {
    text:
      typeof text !== "string" || text.length === 0
        ? "text is required"
        : undefined,
    from:
      typeof from !== "string" || from.length === 0
        ? "from is required"
        : undefined,

    colorHex:
      typeof colorHex !== "string" || colorHex.length === 0
        ? "color hex code is required"
        : undefined,
    font_id:
      typeof font !== "string" || font.length === 0
        ? "font_id is required"
        : undefined,
  };
  const color_id = await getColorByHex(colorHex);
  const font_id = await getFontByName(font);
  invariant(color_id, "color hex not found");
  invariant(font_id, "font not found");

  if (Object.values(errors).every((error) => error === undefined)) {
    await createMessage({
      text,
      from,
      color_id: color_id.color_id,
      font_id: font_id.font_id,
      card_id,
      image_url: imageUrl ?? null,
    });
    return redirect(`/${hash}`);
  } else return errors;
}

export const meta: MetaFunction = () => {
  return {
    title: "Create Message",
  };
};

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export default function NewMessagePage() {
  const errors = useActionData();
  const textRef = React.useRef<HTMLInputElement>(null);
  const fromRef = React.useRef<HTMLInputElement>(null);
  const fontRef = React.useRef<HTMLInputElement>(null);
  const colorHexRef = React.useRef<HTMLInputElement>(null);
  const imageUrlRef = React.useRef<HTMLInputElement>(null);
  const loaderData = useLoaderData<typeof loader>();
  const [imageUrl, setImageUrl] = React.useState<string>();
  const { colorData, fontData } = useLoaderData<any>();
  const [color, setColor] = React.useState<string>();
  const [font, setFont] = React.useState<string>();

  const [fontAnchor, setFontAnchor] = React.useState<HTMLElement | null>(null);
  const theme = createTheme({
    typography: {
      fontFamily: font !== undefined ? font : undefined,
    },
    palette: { text: { primary: color !== undefined ? color : undefined } },
  });

  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);

  return (
    <Container className="CreateMessage">
      <Form
        className="CreateMessage__box"
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Typography className="CreateMessage__title" variant="h5">
          Create Message
        </Typography>
        <div>
          <Popover
            open={displayColorPicker}
            onClose={() => setDisplayColorPicker(false)}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
          >
            <GithubPicker
              triangle="hide"
              colors={colorData.map((color: any) => color.hex)}
              color={color}
              onChangeComplete={(color) => {
                setColor(color.hex);
                setDisplayColorPicker(false);
              }}
            />
          </Popover>
          <input name="font" ref={fontRef} value={font} hidden />
          <input name="colorHex" ref={colorHexRef} value={color} hidden />
          <Menu
            sx={{ mt: "-80px" }}
            id="menu-appbar"
            anchorEl={fontAnchor}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            keepMounted
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            open={Boolean(fontAnchor)}
          >
            {fontData !== undefined &&
              fontData.map((font: any) => (
                <MenuItem
                  key={font.font_id}
                  value={font.name}
                  onClick={(event) => {
                    setFont(
                      `"${(event.target as HTMLInputElement)?.textContent}"` ??
                        undefined
                    );
                    setFontAnchor(null);
                  }}
                  style={{ fontFamily: font.name }}
                >
                  {font.name.slice(1, -1)}
                </MenuItem>
              ))}
          </Menu>
        </div>
        <ThemeProvider theme={theme}>
          <TextField
            autoFocus
            className="CreateMessage__input"
            error={errors?.text !== undefined}
            helperText={errors?.text}
            id="text"
            label="Message"
            minRows={3}
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <IconButton
                      className="CreateMessage__fontButton"
                      onClick={(event) => setFontAnchor(event.currentTarget)}
                    >
                      <FontDownloadIcon />
                    </IconButton>
                    <IconButton
                      className="CreateMessage__colorButton"
                      style={{
                        color: color !== undefined ? color : "black",
                      }}
                      onClick={() => setDisplayColorPicker(!displayColorPicker)}
                    >
                      <SquareIcon />
                    </IconButton>
                  </div>
                </InputAdornment>
              ),
            }}
            multiline
            name="text"
            ref={textRef}
            required
            size="small"
            sx={{
              label: { fontFamily: undefined },
              input: {
                multilineColor: color,
                fontFamily: [font !== undefined ? font[1] : undefined],
              },
            }}
          />
        </ThemeProvider>
        <TextField
          className="CreateMessage__input"
          error={errors?.imageUrl !== undefined}
          helperText={errors?.imageUrl}
          id="imageUrl"
          label="Image URL"
          name="imageUrl"
          ref={imageUrlRef}
          size="small"
          onChange={(e) => setImageUrl(e.target.value)}
        />
        {imageUrl !== undefined ? <Box component="img" src={imageUrl} /> : null}
        <TextField
          className="CreateMessage__input"
          error={errors?.from !== undefined}
          helperText={errors?.from}
          id="from"
          label="From"
          name="from"
          ref={fromRef}
          required
          size="small"
        />
        <input type="hidden" name="hash" value={loaderData.card.hash} />
        <input type="hidden" name="card_id" value={loaderData.card.card_id} />
        <Button
          color="success"
          className="CreateMessage__button"
          type="submit"
          variant="contained"
        >
          Create
        </Button>
      </Form>
    </Container>
  );
}
