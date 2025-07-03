import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBookingsByRenter = query({
  args: { renterId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_renter", (q) => q.eq("renterId", args.renterId))
      .order("desc")
      .collect();
  },
});
