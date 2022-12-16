import { Link, Typography } from "@mui/material";
import { Link as RemixLink } from "@remix-run/react";
import classNames from "classnames";

interface LogoProps {
  color?: "white" | "black";
  size?: "small" | "medium";
}

export default function Logo({ color = "white", size = "small" }: LogoProps) {
  return (
    <Link
      component={RemixLink}
      to="/"
      className="Nav__linkButton"
      underline="none"
    >
      <div className={classNames("Logo", `Logo--${color}`, `Logo--${size}`)}>
        <img className="Logo__icon" src="/logo.svg" alt="logo" />
        <Typography className="Logo__text">Caardvark</Typography>
      </div>
    </Link>
  );
}
