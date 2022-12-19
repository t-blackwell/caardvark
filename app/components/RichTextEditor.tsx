import {
  IconButton,
  InputBase,
  MenuItem,
  Popover,
  Select,
} from "@mui/material";
import * as React from "react";
import { GithubPicker } from "react-color";

// web safe fonts
const fonts = [
  "Arial",
  "Verdana",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
] as const;

// material ui colors @500
const colors = [
  "#000",
  "#f44336",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#009688",
  "#ff9800",
  "#ff5722",
  "#795548",
  "#607d8b",
] as const;

export type Color = typeof colors[number];
export type FontFamily = typeof fonts[number];

interface RichTextEditorProps {
  color: Color;
  fontFamily: FontFamily;
  name?: string;
  setColor: React.Dispatch<React.SetStateAction<Color>>;
  setFontFamily: React.Dispatch<React.SetStateAction<FontFamily>>;
}

export default function RichTextEditor({
  color,
  fontFamily,
  name,
  setColor,
  setFontFamily,
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  return (
    <div className="RichTextEditor">
      <div className="RichTextEditor__controls">
        <Select
          className="RichTextEditor__fontSelect"
          onChange={(event) => setFontFamily(event.target.value as FontFamily)}
          size="small"
          style={{ fontFamily }}
          value={fontFamily}
          variant="standard"
        >
          {fonts.map((f) => (
            <MenuItem key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </MenuItem>
          ))}
        </Select>
        <IconButton
          className="AddMessage__colorButton"
          onClick={() => setShowColorPicker((val) => !val)}
        >
          <span
            className="AddMessage__colorButtonIcon"
            style={{ borderColor: color }}
          >
            A
          </span>
        </IconButton>
      </div>
      <InputBase
        name={name}
        placeholder="Start typing message..."
        spellCheck
        style={{ fontFamily, color }}
      />

      <Popover
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
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
          colors={colors as unknown as string[]}
          color={color}
          onChangeComplete={(color) => {
            setColor(color.hex as Color);
            setShowColorPicker(false);
          }}
        />
      </Popover>
    </div>
  );
}
