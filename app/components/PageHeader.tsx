import { Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <div className="PageHeader">
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <div className="PageHeader__actions">{actions}</div>
    </div>
  );
}
