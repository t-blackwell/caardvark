import type { Breakpoint } from "@mui/material";
import { Container, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  maxWidth?: false | Breakpoint | undefined;
}

export default function PageHeader({
  title,
  actions,
  maxWidth = false,
}: PageHeaderProps) {
  return (
    <div className="PageHeader">
      <Container className="PageHeader__content" maxWidth={maxWidth}>
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        <div className="PageHeader__actions">{actions}</div>
      </Container>
    </div>
  );
}
