import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */

import { z } from "zod";

import { publicProcedure } from "@/server/api/trpc";
import { eventRouter } from "./routers/events";
import { foodRouter } from "./routers/food";
import { teamsRouter } from "./routers/teams";
import { ordersRouter } from "./routers/orders";

// Dummy API router
const dummyRouter = createTRPCRouter({
	hello: publicProcedure
		.input(z.object({ name: z.string().optional() }))
		.query(({ input }) => {
			return { message: `Hello, ${input.name ?? "world"}!` };
		}),
});

export const appRouter = createTRPCRouter({
	events: eventRouter,
	food: foodRouter,
	teams: teamsRouter,
	orders: ordersRouter,
	dummy: dummyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
