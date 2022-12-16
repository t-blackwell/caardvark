import { ConditionalWrapper } from "./ConditionalWrapper";
import { Typography } from "@mui/material";
import classnames from "classnames";

interface TemplatePreviewProps {
  className?: string;
  backgroundCss?: React.CSSProperties;
  onClick?: () => void;
  size?: "small" | "medium" | "large";
  text: string;
  textCss?: React.CSSProperties;
}

export default function TemplatePreview({
  className,
  backgroundCss,
  onClick,
  size = "small",
  text,
  textCss,
}: TemplatePreviewProps) {
  return (
    <div
      className={classnames(
        "TemplatePreview",
        `TemplatePreview--${size}`,
        className
      )}
    >
      <ConditionalWrapper
        showWrapper={onClick !== undefined}
        wrapper={(children) => (
          <button
            className="TemplatePreview__button"
            onClick={onClick}
            type="button"
          >
            {children}
          </button>
        )}
      >
        <div className="TemplatePreview__card" style={backgroundCss}>
          <Typography className="TemplatePreview__text" style={textCss}>
            <div
              dangerouslySetInnerHTML={{
                __html: text.replace(/\n/g, "<br />"),
              }}
            />
          </Typography>
        </div>
      </ConditionalWrapper>
    </div>
  );
}
