import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const eventRouter = createTRPCRouter({
	getAllEvents: publicProcedure.query(async ({ ctx }) => {
		const eventsData = await ctx.db.event.findMany({
			include: {
				teams: true,
				inventory: {
					include: {
						inventoryItems: true,
					},
				},
				_count: {
					select: {
						orders: true,
						teams: true,
					},
				},
			},
		});

		const events = eventsData.map((event) => ({
			...event,
			orderCount: event._count.orders,
			teamCount: event._count.teams,
			foodItemCount: event.inventory?.inventoryItems.length || 0,
		}));

		return events;
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.event.findUnique({
				where: { id: input.id },
				include: {
					teams: true,
					inventory: {
						include: {
							inventoryItems: true,
						},
					},
					orders: {
						include: {
							team: true,
							items: {
								include: {
									foodItem: true,
								},
							},
						},
					},
				},
			});
		}),

	getEventTeams: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.team.findMany({
				where: { eventId: input.eventId },
				include: {
					_count: {
						select: {
							orders: true,
						},
					},
				},
			});
		}),

	// addTeamToEvent: protectedProcedure
	// 	.input(
	// 		z.object({
	// 			eventId: z.string(),
	// 			name: z.string(),
	// 			username: z.string(),
	// 			password: z.string(),
	// 		}),
	// 	)
	// 	.mutation(async ({ ctx, input }) => {
	// 		return await ctx.db.team.create({
	// 			data: {
	// 				name: input.name,
	// 				username: input.username,
	// 				password: input.password, // Should be hashed in production
	// 				eventId: input.eventId,
	// 			},
	// 		});
	// 	}),

	removeTeamFromEvent: protectedProcedure
		.input(
			z.object({
				teamId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.team.delete({
				where: { id: input.teamId },
			});
		}),

	// Event Food Management
	getEventFoodItems: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			const inventory = await ctx.db.inventory.findUnique({
				where: { eventId: input.eventId },
				include: {
					inventoryItems: {
						include: {
							foodItem: true,
						},
					},
				},
			});
			return inventory?.inventoryItems || [];
		}),

	addFoodToEvent: protectedProcedure
		.input(
			z.object({
				foodId: z.string(),
				eventId: z.string(),
				maxOrderPerTeam: z.number().min(0).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			let inventory = await ctx.db.inventory.findUnique({
				where: { eventId: input.eventId },
			});

			if (!inventory) {
				inventory = await ctx.db.inventory.create({
					data: { eventId: input.eventId },
				});
			}

			const existingItem = await ctx.db.inventoryItem.findFirst({
				where: {
					inventoryId: inventory.id,
					foodItemId: input.foodId,
				},
			});

			if (existingItem) {
				throw new Error("Food item is already allocated to this event");
			}

			return await ctx.db.inventoryItem.create({
				data: {
					inventoryId: inventory.id,
					foodItemId: input.foodId,
					maxOrderPerTeam: input.maxOrderPerTeam,
				},
				include: {
					foodItem: true,
				},
			});
		}),

	updateInventoryItem: protectedProcedure
		.input(
			z.object({
				inventoryItemId: z.string(),
				maxOrderPerTeam: z.number().min(0).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.inventoryItem.update({
				where: { id: input.inventoryItemId },
				data: {
					maxOrderPerTeam: input.maxOrderPerTeam,
				},
				include: {
					foodItem: true,
				},
			});
		}),

	removeFoodFromEvent: protectedProcedure
		.input(
			z.object({
				inventoryItemId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.inventoryItem.delete({
				where: { id: input.inventoryItemId },
			});
		}),

	getAvailableFoodItems: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			const allFoodItems = await ctx.db.foodItem.findMany({
				where: { isActive: true },
			});

			const inventory = await ctx.db.inventory.findUnique({
				where: { eventId: input.eventId },
				include: {
					inventoryItems: {
						select: {
							foodItemId: true,
						},
					},
				},
			});

			const allocatedFoodIds =
				inventory?.inventoryItems.map((item) => item.foodItemId) || [];

			return allFoodItems.filter((item) => !allocatedFoodIds.includes(item.id));
		}),

	create: protectedProcedure
		.input(
			z.object({
				eventName: z.string().min(1),
				description: z.string().optional(),
				startDate: z.date(),
				endDate: z.date(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.event.create({
				data: {
					name: input.eventName,
					description: input.description,
					startDate: input.startDate,
					endDate: input.endDate,
					adminId: ctx.session.user.id ?? "",
				},
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				eventName: z.string().min(1),
				description: z.string().optional(),
				startDate: z.date(),
				endDate: z.date(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			return await ctx.db.event.update({
				where: { id },
				data: {
					name: data.eventName,
					description: data.description,
					startDate: data.startDate,
					endDate: data.endDate,
				},
			});
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.event.delete({
				where: { id: input.id },
			});
		}),
});
