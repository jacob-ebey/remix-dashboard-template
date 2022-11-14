import { redirect, type LoaderArgs } from "@remix-run/node";

import * as utils from "~/utils";

export async function loader({
  context: {
    services: { auth },
  },
  request,
}: LoaderArgs) {
  const url = new URL(request.url);
  const redirectTo = utils.getRedirectTo(url.searchParams, "/");

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await auth.clearSession(request),
    },
  });
}

export async function action({
  context: {
    services: { auth },
  },
  request,
}: LoaderArgs) {
  const url = new URL(request.url);
  const redirectTo = utils.getRedirectTo(url.searchParams, "/");

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await auth.clearSession(request),
    },
  });
}
