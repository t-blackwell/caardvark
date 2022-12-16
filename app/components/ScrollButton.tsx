import NorthIcon from "@mui/icons-material/North";
import { IconButton } from "@mui/material";
import { useEffect, useState } from "react";

export default function ScrollUpButton() {
  function handleScrollUp() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  const [scrollPosition, setScrollPosition] = useState(0);
  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return scrollPosition > 600 ? (
    <div className="ScrollUpButton">
      <IconButton type="button" onClick={handleScrollUp}>
        <NorthIcon fontSize="large" />
      </IconButton>
    </div>
  ) : null;
}
