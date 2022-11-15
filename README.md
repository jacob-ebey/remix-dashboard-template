# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Getting Started with the template

```sh
npx create-remix@latest --install --typescript --template jacob-ebey/remix-dashboard-template
```

You will have the option of:

- No DB using a mock service
- Prisma with SQLite
- Prisma with PostgreSQL

## Development

Start the Remix development asset server and the Express server by running:

```sh
npm run dev
```

This starts your app in development mode, which will purge the server require cache when Remix rebuilds assets so you don't need a process manager restarting the express server.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

If you're familiar with deploying express applications you should be right at home just make sure to deploy the output of `remix build`

- `build/`
- `public/build/`
