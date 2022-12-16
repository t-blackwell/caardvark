import NavBar from "./components/NavBar";
import ClientStyleContext from "./contexts/ClientStyleContext";
import { getUser } from "./session.server";
import theme from "./theme";
import { useOptionalUser } from "./utils";
import { withEmotionCache } from "@emotion/react";
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
  useLocation,
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
  return json({
    user: await getUser(request),
  });
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
            href="https://fonts.googleapis.com/css2?family=Covered+By+Your+Grace&family=Roboto:wght@300;400;500;700&display=swap"
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
  return (
    <Document>
      <Outlet />
    </Document>
  );
}
