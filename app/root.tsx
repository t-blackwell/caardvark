import ActionButton from "./components/ActionButton";
import { HeroBanner } from "./components/HeroBanner";
import NavBar from "./components/NavBar";
import Page from "./components/Page";
import ClientStyleContext from "./contexts/ClientStyleContext";
import { getSession, getUser, getSessionHeaders } from "./session.server";
import theme from "./theme";
import { getMessage } from "./toast-message.server";
import { useOptionalUser } from "./utils";
import { withEmotionCache } from "@emotion/react";
import { Snackbar, Typography } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import useEnhancedEffect from "@mui/utils/useEnhancedEffect";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import * as React from "react";
import styles from "~/styles/App.css";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  "theme-color": theme.palette.primary.main,
  title: "Caardvark",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);
  const toastMessage = getMessage(session);
  const user = await getUser(request);

  return json(
    { toastMessage, user },
    { headers: await getSessionHeaders(session) }
  );
}

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}
interface DocumentProps {
  children: React.ReactNode;
  title?: string;
}

const Document = withEmotionCache(
  ({ children, title }: DocumentProps, emotionCache) => {
    const clientStyleData = React.useContext(ClientStyleContext);
    const maybeUser = useOptionalUser();
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
      null
    );
    const location = useLocation();
    // Only executed on client
    useEnhancedEffect(() => {
      // re-link sheet container
      emotionCache.sheet.container = document.head;
      // re-inject tags
      const tags = emotionCache.sheet.tags;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        // eslint-disable-next-line no-underscore-dangle
        (emotionCache.sheet as any)._insertTag(tag);
      });
      // reset cache to reapply global styles
      clientStyleData.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&family=Nunito:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
            rel="stylesheet"
          />

          <meta
            name="emotion-insertion-point"
            content="emotion-insertion-point"
          />
        </head>
        <body>
          {!["/login", "/signup"].includes(location.pathname) ? (
            <header>
              <NavBar
                anchorElUser={anchorElUser}
                setAnchorElUser={setAnchorElUser}
                user={maybeUser}
              />
            </header>
          ) : null}
          <main>{children}</main>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    );
  }
);

export default function App() {
  const { toastMessage } = useLoaderData<typeof loader>();
  const { message, type } = toastMessage ?? {};
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  React.useEffect(() => {
    setSnackbarOpen(toastMessage !== null);
  }, [toastMessage]);

  const handleSnackbarClose = (
    _event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Document>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={type}
          variant="filled"
        >
          {message}
        </MuiAlert>
      </Snackbar>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const navigate = useNavigate();
  const is404 = caught.status === 404;
  const docTitle = is404 ? "Page Not Found" : "Something went wrong";

  return (
    <Document title={docTitle}>
      <Page className="CatchBoundary">
        <HeroBanner
          title={docTitle}
          subtitle={
            <div className="CatchBoundary__bannerSubtitle">
              <Typography color="text.secondary">
                Error {caught.status}
              </Typography>
              <img
                className="CatchBoundary__bannerImage"
                src="/assets/undraw_notify_re_65on.svg"
                alt="person with exclamation mark"
              />
              {is404 ? (
                <ActionButton
                  title="Go back to home page"
                  to="/"
                  variant="outlined"
                />
              ) : (
                <ActionButton
                  title="Go back"
                  onClick={() => navigate(-1)}
                  variant="outlined"
                />
              )}
            </div>
          }
        />
        {!is404 && caught.data && process.env.NODE_ENV === "development" ? (
          <pre className="CatchBoundary__stackTrace">
            {JSON.stringify(caught.data, null, 2)}
          </pre>
        ) : null}
      </Page>
    </Document>
  );
}
