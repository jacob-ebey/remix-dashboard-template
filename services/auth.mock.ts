import {
	redirect,
	createCookieSessionStorage,
	type SessionStorage,
} from "@remix-run/node";

import { type AuthService } from "~/services";

export class MockAuthService implements AuthService {
	private sessionStorage: SessionStorage;

	constructor(secrets: string[]) {
		this.sessionStorage = createCookieSessionStorage({
			cookie: {
				name: "auth",
				httpOnly: true,
				path: "/",
				sameSite: "lax",
				secrets,
			},
		});
	}

	async getUserId(request: Request) {
		const cookie = request.headers.get("Cookie");
		const session = await this.sessionStorage.getSession(cookie);

		return session.get("userId") as string | undefined;
	}

	async requireUserId(request: Request) {
		const userId = await this.getUserId(request);

		if (!userId) {
			const url = new URL(request.url);
			const redirectTo = url.pathname + url.search;

			const searchParams = new URLSearchParams({
				redirectTo,
			});

			throw redirect(`/login?${searchParams.toString()}`);
		}

		return userId;
	}

	async setUserId(request: Request, userId: string) {
		const cookie = request.headers.get("Cookie");
		const session = await this.sessionStorage.getSession(cookie);
		session.set("userId", userId);

		return await this.sessionStorage.commitSession(session, {
			secure: request.url.startsWith("https://"),
		});
	}

	async clearSession(request: Request) {
		const cookie = request.headers.get("Cookie");
		const session = await this.sessionStorage.getSession(cookie);

		return await this.sessionStorage.destroySession(session, {
			secure: request.url.startsWith("https://"),
		});
	}
}
