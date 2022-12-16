import { ConditionalWrapper } from "./ConditionalWrapper";
import { Typography } from "@mui/material";
import classnames from "classnames";

interface TemplatePreviewProps {
  className?: string;
  backgroundCss?: React.CSSProperties;
  onClick?: () => void;
  text: string;
  textCss?: React.CSSProperties;
}

export default function TemplatePreview({
  className,
  backgroundCss,
  onClick,
  text,
  textCss,
}: TemplatePreviewProps) {
  return (
    <div className={classnames("TemplatePreview", className)}>
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
            {text}
          </Typography>
        </div>
      </ConditionalWrapper>
    </div>
  );
}
