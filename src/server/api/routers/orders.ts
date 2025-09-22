import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { OrderStatusType } from "@prisma/client";

export const ordersRouter = createTRPCRouter({
	// Get all orders (for admin)
	getAllOrders: publicProcedure.query(async ({ ctx }) => {
		return await ctx.db.order.findMany({
			include: {
				items: {
					include: {
						foodItem: true,
					},
				},
				team: true,
				event: true,
			},
			orderBy: {
				placedAt: "desc",
			},
		});
	}),

	// Get orders for a specific team
	getTeamOrders: publicProcedure
		.input(z.object({ teamId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.order.findMany({
				where: { teamId: input.teamId },
				include: {
					items: {
						include: {
							foodItem: true,
						},
					},
					event: true,
				},
				orderBy: {
					placedAt: "desc",
				},
			});
		}),

	// Get orders for a specific event
	getEventOrders: publicProcedure
		.input(z.object({ eventId: z.string() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.order.findMany({
				where: { eventId: input.eventId },
				include: {
					items: {
						include: {
							foodItem: true,
						},
					},
					team: true,
				},
				orderBy: {
					placedAt: "desc",
				},
			});
		}),

	// Create a new order
	createOrder: protectedProcedure
		.input(
			z.object({
				teamId: z.string(),
				eventId: z.string(),
				items: z.array(
					z.object({
						foodItemId: z.string(),
						quantity: z.number().min(1),
						priceAtOrder: z.number().min(0),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Calculate total amount
			const totalAmount = input.items.reduce(
				(sum, item) => sum + item.quantity * item.priceAtOrder,
				0,
			);

			// Check if team is enrolled in the event
			const team = await ctx.db.team.findUnique({
				where: { id: input.teamId },
				include: { event: true },
			});

			if (!team || team.eventId !== input.eventId) {
				throw new Error("Team is not enrolled in this event");
			}

			// Check if event is active
			const event = await ctx.db.event.findUnique({
				where: { id: input.eventId },
			});

			if (!event) {
				throw new Error("Event not found");
			}

			const now = new Date();
			if (now < event.startDate || now > event.endDate) {
				throw new Error("Event is not currently active for ordering");
			}

			// Get event inventory to check limits and availability
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

			if (!inventory) {
				throw new Error("No inventory found for this event");
			}

			// Check each item's availability and team limits
			for (const orderItem of input.items) {
				const inventoryItem = inventory.inventoryItems.find(
					(item) => item.foodItemId === orderItem.foodItemId,
				);

				if (!inventoryItem) {
					throw new Error(
						`Food item ${orderItem.foodItemId} is not available for this event`,
					);
				}

				// Check if food item is active
				if (!inventoryItem.foodItem.isActive) {
					throw new Error(
						`Food item ${inventoryItem.foodItem.name} is no longer available`,
					);
				}

				// Check available quantity
				if (inventoryItem.foodItem.availableQty < orderItem.quantity) {
					throw new Error(
						`Not enough quantity available for ${inventoryItem.foodItem.name}. Available: ${inventoryItem.foodItem.availableQty}, Requested: ${orderItem.quantity}`,
					);
				}

				// Check team ordering limits
				if (inventoryItem.maxOrderPerTeam) {
					const existingOrders = await ctx.db.orderItem.aggregate({
						where: {
							foodItemId: orderItem.foodItemId,
							order: {
								teamId: input.teamId,
								eventId: input.eventId,
							},
						},
						_sum: {
							quantity: true,
						},
					});

					const totalOrderedByTeam = existingOrders._sum.quantity || 0;
					if (
						totalOrderedByTeam + orderItem.quantity >
						inventoryItem.maxOrderPerTeam
					) {
						throw new Error(
							`Team order limit exceeded for ${inventoryItem.foodItem.name}. Limit: ${inventoryItem.maxOrderPerTeam}, Already ordered: ${totalOrderedByTeam}, Requested: ${orderItem.quantity}`,
						);
					}
				}
			}

			// Create the order with items in a transaction
			const order = await ctx.db.$transaction(async (tx) => {
				// Create the order
				const newOrder = await tx.order.create({
					data: {
						teamId: input.teamId,
						eventId: input.eventId,
						totalAmount,
						orderStatus: "PENDING",
						paymentStatus: "pending",
					},
				});

				// Create order items and update food quantities
				for (const orderItem of input.items) {
					await tx.orderItem.create({
						data: {
							orderId: newOrder.id,
							foodItemId: orderItem.foodItemId,
							quantity: orderItem.quantity,
							priceAtOrder: orderItem.priceAtOrder,
						},
					});

					// Update available quantity
					await tx.foodItem.update({
						where: { id: orderItem.foodItemId },
						data: {
							availableQty: {
								decrement: orderItem.quantity,
							},
						},
					});
				}

				return newOrder;
			});

			// Return the complete order with items
			return await ctx.db.order.findUnique({
				where: { id: order.id },
				include: {
					items: {
						include: {
							foodItem: true,
						},
					},
					team: true,
					event: true,
				},
			});
		}),

	// Update order status (for admin use)
	updateOrderStatus: protectedProcedure
		.input(
			z.object({
				orderId: z.number(),
				orderStatus: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]),
				paymentStatus: z.enum(["pending", "paid"]).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.order.update({
				where: { id: input.orderId },
				data: {
					orderStatus: input.orderStatus,
					...(input.paymentStatus && { paymentStatus: input.paymentStatus }),
				},
				include: {
					items: {
						include: {
							foodItem: true,
						},
					},
					team: true,
					event: true,
				},
			});
		}),

	// Cancel an order (restore quantities)
	cancelOrder: protectedProcedure
		.input(z.object({ orderId: z.number() }))
		.mutation(async ({ ctx, input }) => {
			const order = await ctx.db.order.findUnique({
				where: { id: input.orderId },
				include: {
					items: true,
				},
			});

			if (!order) {
				throw new Error("Order not found");
			}

			if (
				order.orderStatus === "COMPLETED" ||
				order.orderStatus === "CANCELLED"
			) {
				throw new Error("Cannot cancel this order");
			}

			// Cancel order and restore quantities in transaction
			return await ctx.db.$transaction(async (tx) => {
				// Restore quantities for each item
				for (const item of order.items) {
					await tx.foodItem.update({
						where: { id: item.foodItemId },
						data: {
							availableQty: {
								increment: item.quantity,
							},
						},
					});
				}

				// Update order status
				const updatedOrder = await tx.order.update({
					where: { id: input.orderId },
					data: {
						orderStatus: "CANCELLED",
					},
					include: {
						items: {
							include: {
								foodItem: true,
							},
						},
						team: true,
						event: true,
					},
				});

				return updatedOrder;
			});
		}),
});
