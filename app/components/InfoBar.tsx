import { Toolbar } from "@mui/material";

interface InfoBarProps {
  children: React.ReactNode;
}

export default function InfoBar({ children }: InfoBarProps) {
  return (
    <Toolbar className="InfoBar" variant="dense">
      <div className="InfoBar__content">{children}</div>
    </Toolbar>
  );
}
