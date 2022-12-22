import type { Session } from "@remix-run/node";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { user } from "~/models/user.server";
import { getUserById } from "~/models/user.server";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

const USER_SESSION_KEY = "userId";
const EMAIL_VERIFY_SESSION_KEY = "emailVerify";

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getSessionHeaders(session: Session) {
  return {
    "Set-Cookie": await sessionStorage.commitSession(session),
  };
}

export async function getUserId(
  request: Request
): Promise<user["user_id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId ? Number(userId) : undefined;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined || isNaN(userId)) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(request: Request, redirectTo?: string) {
  const currentTo = new URL(request.url).pathname;
  const userId = await getUserId(request);
  if (userId === undefined || isNaN(userId)) {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo ?? currentTo],
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function setEmailVerify(request: Request, email: user["email"]) {
  const session = await getSession(request);
  session.set(EMAIL_VERIFY_SESSION_KEY, email);
  throw redirect("/verify", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function getEmailVerify(
  request: Request
): Promise<user["email"] | undefined> {
  const session = await getSession(request);
  const emailVerify = session.get(EMAIL_VERIFY_SESSION_KEY);
  return emailVerify;
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectTo: string;
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  session.unset(EMAIL_VERIFY_SESSION_KEY);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
