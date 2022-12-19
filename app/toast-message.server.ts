import type { Session } from "@remix-run/node";

export type ToastMessage = { message: string; type: "success" | "error" };

const toastMessageName = "toastMessage";

export function setSuccessMessage(session: Session, message: string) {
  session.flash(toastMessageName, { message, type: "success" } as ToastMessage);
}

export function setErrorMessage(session: Session, message: string) {
  session.flash(toastMessageName, { message, type: "error" } as ToastMessage);
}

export function getMessage(session: Session): ToastMessage | null {
  return session.get(toastMessageName) ?? null;
}
