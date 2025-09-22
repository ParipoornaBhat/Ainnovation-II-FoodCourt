import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const teamCredentialsRouter = createTRPCRouter({
	getByTeamId: publicProcedure
		.input(z.object({ teamId: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				return await ctx.db.teamCredential.findMany({
					where: {
						teamId: input.teamId,
					},
					orderBy: {
						createdAt: "desc",
					},
				});
			} catch (error) {
				console.error("Error fetching team credentials:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to fetch team credentials",
				});
			}
		}),

	create: protectedProcedure
		.input(
			z.object({
				teamId: z.string(),
				email: z.string().nullable(),
				password: z.string().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await ctx.db.teamCredential.create({
					data: {
						teamId: input.teamId,
						email: input.email,
						password: input.password,
					},
				});
			} catch (error) {
				console.error("Error creating team credential:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create team credential",
				});
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				email: z.string().nullable(),
				password: z.string().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await ctx.db.teamCredential.update({
					where: { id: input.id },
					data: {
						email: input.email,
						password: input.password,
					},
				});
			} catch (error) {
				console.error("Error updating team credential:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to update team credential",
				});
			}
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				return await ctx.db.teamCredential.delete({
					where: { id: input.id },
				});
			} catch (error) {
				console.error("Error deleting team credential:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to delete team credential",
				});
			}
		}),
});
