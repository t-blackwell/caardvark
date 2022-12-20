import { Toolbar } from "@mui/material";

interface InfoBarProps {
  children: React.ReactNode;
}

export default function InfoBar({ children }: InfoBarProps) {
  return (
    <Toolbar className="InfoBar" variant="dense">
      {children}
    </Toolbar>
  );
}
