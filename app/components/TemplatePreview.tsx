import { ConditionalWrapper } from "./ConditionalWrapper";
import { Typography } from "@mui/material";

interface TemplatePreviewProps {
  backgroundCss?: React.CSSProperties;
  onClick?: () => void;
  text: string;
  textCss?: React.CSSProperties;
}

export default function TemplatePreview({
  backgroundCss,
  onClick,
  text,
  textCss,
}: TemplatePreviewProps) {
  return (
    <div className="TemplatePreview">
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
