const { prisma } = require("$lib/server/prisma");

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
	var prisma: PrismaClient
}

export {};
