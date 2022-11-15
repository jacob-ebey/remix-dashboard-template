import { json, type LoaderArgs } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";

export async function loader({
	context: {
		services: { auth },
	},
	request,
}: LoaderArgs) {
	const userId = await auth.getUserId(request);

	return json({ loggedIn: !!userId });
}

export default function Home() {
	const { loggedIn } = useLoaderData<typeof loader>();
	return (
		<main className="h-screen w-screen flex flex-col gap-4 items-center justify-center max-w-md mx-auto">
			<h1 className="text-4xl">Remix Dashboard Starter</h1>

			<p>A simple dashboard starter to get you up and running.</p>

			{loggedIn ? (
				<Link to="items" className="block text-center px-4 py-2 hover:outline">
					Dashboard
				</Link>
			) : (
				<Form action={`/login?redirectTo=/`} method="post">
					<button className="block text-center px-4 py-2 hover:outline">
						Login with GitHub
					</button>
				</Form>
			)}
		</main>
	);
}
