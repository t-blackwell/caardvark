import { ConditionalWrapper } from "./ConditionalWrapper";
import type { ButtonProps } from "@mui/material";
import { Link } from "@mui/material";
import { Button } from "@mui/material";
import { Link as RemixLink } from "@remix-run/react";
import classnames from "classnames";
import type { To } from "react-router-dom";
import useSmallScreen from "~/hooks/useSmallScreen";

interface ActionButtonProps
  extends Pick<
    ButtonProps,
    | "className"
    | "color"
    | "disabled"
    | "fullWidth"
    | "name"
    | "onClick"
    | "size"
    | "type"
    | "value"
    | "variant"
  > {
  icon?: React.ReactNode;
  title: string;
  to?: To;
}

/**
 * Returns a button for the PageHeading
 *
 * TODO: have a discriminated union for the type of button action
 * i.e. link, submit or custom onClick
 */
export default function ActionButton({
  className,
  color,
  disabled,
  fullWidth,
  icon,
  name,
  onClick,
  size,
  title,
  to,
  type,
  value,
  variant,
}: ActionButtonProps) {
  const smScreen = useSmallScreen();
  const screenSize = useSmallScreen() ? "sm" : "xs";
  return (
    <ConditionalWrapper
      showWrapper={to !== undefined}
      wrapper={(children) => (
        // not null assertion is safe due to `showWrapper`
        // would be nice if type was narrowed automatically
        <Link component={RemixLink} underline="none" to={to!}>
          {children}
        </Link>
      )}
    >
      <Button
        className={classnames(
          className,
          "ActionButton",
          `ActionButton--${screenSize}`
        )}
        color={color}
        disabled={disabled}
        fullWidth={fullWidth}
        name={name}
        onClick={onClick}
        size={size}
        type={type}
        value={value}
        variant={variant}
      >
        {smScreen || icon === undefined ? title : icon}
      </Button>
    </ConditionalWrapper>
  );
}
