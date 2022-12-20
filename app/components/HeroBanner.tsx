import { Typography } from "@mui/material";
import * as React from "react";

interface HeroBannerProps {
  subtitle?: React.ReactNode;
  title: string;
}

export function HeroBanner({ subtitle, title }: HeroBannerProps) {
  return (
    <div className="HeroBanner">
      <Typography variant="h3" component="h1">
        {title}
      </Typography>
      {subtitle}
    </div>
  );
}
