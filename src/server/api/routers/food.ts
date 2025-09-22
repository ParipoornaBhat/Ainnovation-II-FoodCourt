import { createTRPCRouter } from "../trpc";
import { publicProcedure, protectedProcedure } from "../trpc";

import { z } from "zod";

export const foodRouter = createTRPCRouter({
	getAllFoodItems: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.foodItem.findMany({
			orderBy: {
				availableQty: "asc",
			},
		});
	}),

	getFoodItemById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.foodItem.findUnique({
				where: { id: input.id },
			});
		}),

	createFoodItem: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				description: z.string().optional(),
				price: z.number().min(0),
				imageUrl: z.string().url().optional(),
				availableQty: z.number().min(0).default(0),
				restrictions: z.array(z.string()).optional().default([]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.foodItem.create({
				data: {
					name: input.name,
					description: input.description,
					price: input.price,
					imageUrl: input.imageUrl,
					availableQty: input.availableQty,
					restrictions: input.restrictions,
				},
			});
		}),

	updateFoodItem: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
				price: z.number().min(0).optional(),
				imageUrl: z.string().url().optional(),
				restrictions: z.array(z.string()).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.foodItem.update({
				where: { id: input.id },
				data: {
					name: input.name,
					description: input.description,
					price: input.price,
					imageUrl: input.imageUrl,
					restrictions: input.restrictions,
				},
			});
		}),

	updateFoodItemStock: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				availableQty: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.foodItem.update({
				where: { id: input.id },
				data: {
					availableQty: input.availableQty,
				},
			});
		}),

	deleteFoodItem: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.foodItem.delete({
				where: { id: input.id },
			});
		}),
});
