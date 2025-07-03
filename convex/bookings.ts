import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createBooking = mutation({
  args: {
    itemId: v.id("items"),
    renterId: v.id("users"),
    startDate: v.string(), // ISO
    endDate: v.string(),
    pickupMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerDay));

    const totalPrice = totalDays * item.pricePerDay;

    return await ctx.db.insert("bookings", {
      itemId: args.itemId,
      renterId: args.renterId,
      ownerId: item.ownerId,
      startDate: args.startDate,
      endDate: args.endDate,
      totalDays,
      totalPrice,
      depositAmount: item.depositAmount ?? 0,
      status: "pending",
      paymentIntentId: undefined,
      depositReleased: false,
      pickupMethod: args.pickupMethod,
      notes: args.notes,
    });
  },
});
