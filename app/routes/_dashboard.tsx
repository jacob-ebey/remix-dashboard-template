import { json, type LoaderArgs } from "@remix-run/node";
import {
  Form,
  Outlet,
  useLoaderData,
  useLocation,
  type ShouldReloadFunction,
} from "@remix-run/react";

import {
  Dashboard,
  DashboardMenu,
  DashboardMenuHeader,
  ListItem,
  ListItems,
} from "~/components/dashboard";
import * as layout from "~/services/layout.server";

export async function loader({
  context: {
    services: { auth },
  },
  request,
}: LoaderArgs) {
  const pagesPromise = layout.getDashboardPages();

  await auth.requireUserId(request);

  return json({
    pages: await pagesPromise,
  });
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) =>
  !!submission &&
  ["/login", "/logout"].some((pathname) =>
    submission.action.startsWith(pathname)
  );

export default function DashboardLayout() {
  const { pages } = useLoaderData<typeof loader>();
  const location = useLocation();

  const redirectTo = encodeURIComponent(location.pathname + location.search);

  return (
    <>
      <Dashboard>
        <DashboardMenu id="dashboard-menu" menu="dashboard-menu">
          <DashboardMenuHeader label="Menu" menu="dashboard-menu" />

          <ListItems>
            {pages.map(({ label, to }, index) => (
              <ListItem key={"" + index + to + label} to={to}>
                {label}
              </ListItem>
            ))}
          </ListItems>

          <hr />

          <footer className="p-2 text-center">
            <Form action={`/logout?redirectTo=${redirectTo}`} method="post">
              <button className="block w-full text-center p-2 hover:outline">
                Logout
              </button>
            </Form>
          </footer>
        </DashboardMenu>

        <Outlet />
      </Dashboard>
    </>
  );
}
