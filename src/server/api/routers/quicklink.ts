import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

export const quickLinkRouter = createTRPCRouter({
  // Fetch all active quick links (for users)
  getActive: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.quickLink.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Fetch all links (for admin dashboard)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.quickLink.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  // Add new link
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        url: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.db.quickLink.create({
        data: input,
      });
    }),

  // Toggle active/inactive
  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), active: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.quickLink.update({
        where: { id: input.id },
        data: { active: input.active },
      });
    }),

  // Delete a link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.db.quickLink.delete({ where: { id: input.id } });
    }),
});
