import { useMediaQuery } from "@mui/material";

export default function useSmallScreen() {
  return useMediaQuery("(min-width:450px)");
}
