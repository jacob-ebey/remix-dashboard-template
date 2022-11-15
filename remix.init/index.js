const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");

const reader = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

module.exports = setup;

async function setup({ rootDirectory }) {
	const dotenvExamplePath = path.join(rootDirectory, ".env.example");

	try {
		fs.rmSync(path.resolve(rootDirectory, ".github/template.yml"), {
			force: true,
		});
	} catch (e) {}

	const wantsDB = await yesNoQuestion(
		"Would you like a DB? (Y/n)",
		true,
		process.env.DB_PROVIDER
	);

	let runMigrations;
	if (wantsDB) {
		const whatDB = await fromListQuestion(
			"What DB Solution?",
			["Prisma"],
			process.env.DB_PROVIDER
		);

		switch (whatDB) {
			case "Prisma":
				runMigrations = await setupPrisma({ dotenvExamplePath, rootDirectory });
				break;
		}
	}

	const dotenvPath = path.join(rootDirectory, ".env");
	fs.copyFileSync(dotenvExamplePath, dotenvPath);

	if (runMigrations) {
		await runMigrations();
	}
}

async function setupPrisma({ dotenvExamplePath, rootDirectory }) {
	const whatDB = await fromListQuestion(
		"What DB?",
		["SQLite", "PostgreSQL"],
		process.env.DB
	);
	const runMigrations =
		whatDB == "SQLite"
			? await yesNoQuestion(
					"Run Migrations? (Y/n)",
					true,
					process.env.RUN_MIGRATIONS
			  )
			: false;

	let installPrismaResult = childProcess.spawnSync(
		"npm",
		["i", "-D", "prisma"],
		{
			stdio: "inherit",
			cwd: rootDirectory,
		}
	);
	if (installPrismaResult.status !== 0) {
		throw new Error("Failed to install Prisma");
	}
	installPrismaResult = childProcess.spawnSync("npm", ["i", "@prisma/client"], {
		stdio: "inherit",
		cwd: rootDirectory,
	});
	if (installPrismaResult.status !== 0) {
		throw new Error("Failed to install Prisma");
	}

	const dotEnvPath = `_prisma/.env.${whatDB.toLowerCase()}`;

	const prismaDotenvExamplePath = path.resolve(__dirname, dotEnvPath);
	fs.appendFileSync(
		dotenvExamplePath,
		"\n" + fs.readFileSync(prismaDotenvExamplePath, "utf-8")
	);

	const schemaPath = path.resolve(
		__dirname,
		`_prisma/schema.prisma.${whatDB.toLowerCase()}`
	);
	const prismaDir = path.resolve(rootDirectory, "prisma");
	try {
		fs.mkdirSync(prismaDir, { recursive: true });
	} catch (e) {}
	fs.copyFileSync(schemaPath, path.join(prismaDir, "schema.prisma"));

	const servicesDir = path.resolve(rootDirectory, "services");
	const servicePath = path.resolve(__dirname, "_prisma/items.prisma.ts");
	fs.copyFileSync(servicePath, path.join(servicesDir, "items.prisma.ts"));

	const serverPath = path.resolve(rootDirectory, "server.ts");
	const prismaServerPath = path.resolve(__dirname, "_prisma/server.ts");
	fs.copyFileSync(prismaServerPath, serverPath);

	if (whatDB == "PostgreSQL") {
		const postgreSQLDockerComposePath = path.resolve(
			__dirname,
			"_prisma/docker-compose.postgresql.yml"
		);
		const dockerComposePath = path.resolve(rootDirectory, "docker-compose.yml");
		fs.copyFileSync(postgreSQLDockerComposePath, dockerComposePath);
	}

	return () => {
		if (runMigrations) {
			const prismaResult = childProcess.spawnSync(
				"npx",
				["prisma", "migrate", "dev", "--name", "init"],
				{
					stdio: "inherit",
					cwd: rootDirectory,
				}
			);
			if (prismaResult.status !== 0) {
				throw new Error("Failed to run Prisma Migrations");
			}

			console.log(`
To get started locally, run the following command:
  npm run dev
`);
		} else {
			if (whatDB == "PostgreSQL") {
				console.log(`
To get started locally, run the following commands:

start the local DB container:
  docker-compose up -d

run the migrations:
  npx prisma migrate dev --name init

run the dev server:
  npm run dev
`);
			} else {
				console.log(`
To get started locally, run the following commands:

run the migrations:
  npx prisma migrate dev --name init

run the dev server:
  npm run dev
`);
			}
		}
	};
}

/**
 *
 * @param {string} question
 * @param {boolean} defaultAnswer
 * @returns {boolean}
 */
function yesNoQuestion(question, defaultAnswer, cliProvidedAnswer) {
	if (cliProvidedAnswer === "n") return Promise.resolve(false);
	if (cliProvidedAnswer === "y") return Promise.resolve(true);

	return new Promise((resolve) => {
		reader.question(`${question} `, (answer) => {
			if (answer.trim() === "") {
				resolve(defaultAnswer);
			} else if (answer.match(/y/i)) {
				resolve(true);
			} else if (answer.match(/n/i)) {
				resolve(false);
			} else {
				resolve(defaultAnswer);
			}
		});
	});
}

/**
 * @param {string} question
 * @param {string[]} options
 * @returns {string}
 */
function fromListQuestion(question, options, cliProvidedAnswer) {
	if (!!cliProvidedAnswer) {
		let found = options.find(
			(o) => o.toLowerCase() === cliProvidedAnswer.toLowerCase()
		);
		if (!found)
			throw new Error(
				`Invalid answer provided for \`${question}\`: ${cliProvidedAnswer}`
			);
		return Promise.resolve(found);
	}

	return new Promise((resolve) => {
		const q = `${question}\n${options
			.map((o, i) => `${i + 1}. ${o}`)
			.join("\n")}\n`;
		reader.question(q, (answer) => {
			const num = parseInt(answer, 10);
			if (!Number.isInteger(num)) {
				let found;
				if (answer) {
					answer = answer.trim();
					found = options.find((o) => o.toLowerCase() === answer.toLowerCase());
				}
				if (found) {
					resolve(found);
				} else {
					resolve(fromListQuestion(question, options));
				}
			} else if (num < 1 || num > options.length) {
				resolve(fromListQuestion(question, options));
			} else {
				resolve(options[num - 1]);
			}
		});
	});
}
