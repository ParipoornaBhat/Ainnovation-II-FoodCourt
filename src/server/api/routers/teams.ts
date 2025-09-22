import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const teamsRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.team.findMany({
			select: {
				id: true,
				name: true,
				username: true,
				createdAt: true,
			},
			orderBy: {
				name: "asc",
			},
		});
	}),

	getAllTeams: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.team.findMany({
			include: {
				event: true,
				orders: {
					select: {
						id: true,
						totalAmount: true,
						orderStatus: true,
						placedAt: true,
						items: {
							select: {
								id: true,
								quantity: true,
								priceAtOrder: true,
								foodItem: {
									select: {
										id: true,
										name: true,
									},
								},
							},
						},
					},
					orderBy: {
						placedAt: "desc",
					},
				},
				_count: {
					select: {
						orders: true,
					},
				},
			},
			orderBy: {
				name: "asc",
			},
		});
	}),

	getTeamsByEvent: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.team.findMany({
				where: {
					eventId: input.eventId,
				},
				include: {
					event: {
						select: {
							id: true,
							name: true,
						},
					},
					orders: {
						select: {
							id: true,
							totalAmount: true,
							orderStatus: true,
							placedAt: true,
						},
						orderBy: {
							placedAt: "desc",
						},
					},
					_count: {
						select: {
							orders: true,
						},
					},
				},
				orderBy: {
					name: "asc",
				},
			});
		}),

	getTeamById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.team.findUnique({
				where: { id: input.id },
				include: {
					event: {
						select: {
							id: true,
							name: true,
							startDate: true,
							endDate: true,
						},
					},
					orders: {
						include: {
							items: {
								include: {
									foodItem: {
										select: {
											id: true,
											name: true,
											imageUrl: true,
										},
									},
								},
							},
						},
						orderBy: {
							placedAt: "desc",
						},
					},
				},
			});
		}),

	getTeamOrderHistory: publicProcedure
		.input(z.object({ teamId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.order.findMany({
				where: {
					teamId: input.teamId,
				},
				include: {
					items: {
						include: {
							foodItem: {
								select: {
									id: true,
									name: true,
									imageUrl: true,
									price: true,
								},
							},
						},
					},
					event: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				orderBy: {
					placedAt: "desc",
				},
			});
		}),
	addTeamToEventFromAvailable: protectedProcedure
		.input(
			z.object({
				teamId: z.string(),
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.team.update({
				where: { id: input.teamId },
				data: {
					eventId: input.eventId,
				},
				include: {
					event: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		}),
	addToEvent: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				name: z.string().min(1),
				username: z.string().min(1),
				password: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if username already exists
			const existingTeam = await ctx.db.team.findUnique({
				where: { username: input.username },
			});

			if (existingTeam) {
				throw new Error("Username already exists");
			}

			const bcrypt = await import("bcryptjs");
			const hashedPassword = await bcrypt.hash(input.password, 12);

			return await ctx.db.team.create({
				data: {
					name: input.name,
					username: input.username,
					password: hashedPassword,
					eventId: input.eventId,
				},
				include: {
					event: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		}),

	bulkAddToEvent: protectedProcedure
		.input(
			z.object({
				eventId: z.string(),
				teams: z.array(
					z.object({
						name: z.string().min(1),
						username: z.string().min(1),
						password: z.string().min(1),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const bcrypt = await import("bcryptjs");

			// Check for duplicate usernames
			const usernames = input.teams.map((team) => team.username);
			const existingTeams = await ctx.db.team.findMany({
				where: {
					username: {
						in: usernames,
					},
				},
				select: {
					username: true,
				},
			});

			if (existingTeams.length > 0) {
				const duplicateUsernames = existingTeams.map((team) => team.username);
				throw new Error(
					`Usernames already exist: ${duplicateUsernames.join(", ")}`,
				);
			}

			// Hash all passwords
			const teamsWithHashedPasswords = await Promise.all(
				input.teams.map(async (team) => ({
					name: team.name,
					username: team.username,
					password: await bcrypt.hash(team.password, 12),
					eventId: input.eventId,
				})),
			);

			// Create all teams
			return await ctx.db.team.createMany({
				data: teamsWithHashedPasswords,
			});
		}),

	createTeam: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				username: z.string().min(1),
				password: z.string().min(1),
				eventId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const bcrypt = await import("bcryptjs");
			const hashedPassword = await bcrypt.hash(input.password, 12);

			return await ctx.db.team.create({
				data: {
					name: input.name,
					username: input.username,
					password: hashedPassword,
					eventId: input.eventId,
				},
				include: {
					event: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		}),

	updateTeam: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				username: z.string().min(1).optional(),
				password: z.string().min(1).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updateData: {
				name?: string;
				username?: string;
				password?: string;
			} = {
				name: input.name,
				username: input.username,
			};

			if (input.password) {
				const bcrypt = await import("bcryptjs");
				updateData.password = await bcrypt.hash(input.password, 12);
			}

			return await ctx.db.team.update({
				where: { id: input.id },
				data: updateData,
				include: {
					event: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
		}),

	deleteTeam: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.team.update({
				where: { id: input.id },
				data: {
					event: {
						disconnect: true,
					},
				},
			});
		}),

	getTeamStats: publicProcedure.query(async ({ ctx }) => {
		const totalTeams = await ctx.db.team.count();
		const teamsWithOrders = await ctx.db.team.count({
			where: {
				orders: {
					some: {},
				},
			},
		});

		return {
			totalTeams,
			teamsWithOrders,
		};
	}),
});
