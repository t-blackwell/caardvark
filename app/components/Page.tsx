import InfoBar from "./InfoBar";
import PageHeader from "./PageHeader";
import type { Breakpoint } from "@mui/material";
import Container from "@mui/material/Container";
import classNames from "classnames";
import * as React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
  infoBarContent?: React.ReactNode;
  maxWidth?: false | Breakpoint | undefined;
  pageHeaderActions?: React.ReactNode;
  pageHeaderTitle?: string;
}

export default function Page({
  className,
  children,
  infoBarContent,
  maxWidth = "lg",
  pageHeaderActions,
  pageHeaderTitle,
}: PageProps) {
  return (
    <>
      {infoBarContent !== undefined ? (
        <InfoBar>{infoBarContent}</InfoBar>
      ) : null}
      {pageHeaderTitle !== undefined ? (
        <PageHeader
          actions={pageHeaderActions}
          maxWidth={maxWidth}
          title={pageHeaderTitle}
        />
      ) : null}
      <Container className={classNames("Page", className)} maxWidth={maxWidth}>
        {children}
      </Container>
    </>
  );
}
