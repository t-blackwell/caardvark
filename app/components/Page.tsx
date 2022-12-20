import PageHeader from "./PageHeader";
import type { Breakpoint } from "@mui/material";
import Container from "@mui/material/Container";
import classNames from "classnames";
import * as React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: false | Breakpoint | undefined;
  pageHeaderActions?: React.ReactNode;
  pageHeaderTitle?: string;
}

export default function Page({
  className,
  children,
  maxWidth = "lg",
  pageHeaderActions,
  pageHeaderTitle,
}: PageProps) {
  return (
    <>
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
