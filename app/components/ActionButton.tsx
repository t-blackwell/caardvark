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
    | "name"
    | "onClick"
    | "type"
    | "variant"
    | "value"
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
  icon,
  name,
  onClick,
  title,
  to,
  type,
  variant,
  value,
}: ActionButtonProps) {
  const smScreen = useSmallScreen();
  const size = useSmallScreen() ? "sm" : "xs";
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
          `ActionButton--${size}`
        )}
        color={color}
        disabled={disabled}
        name={name}
        onClick={onClick}
        type={type}
        variant={variant}
        value={value}
      >
        {smScreen || icon === undefined ? title : icon}
      </Button>
    </ConditionalWrapper>
  );
}
