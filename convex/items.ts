import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
  args: {
    ownerId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("dress"),
      v.literal("top"),
      v.literal("bottom"),
      v.literal("outerwear"),
      v.literal("shoes"),
      v.literal("accessories"),
      v.literal("jewelry"),
      v.literal("bags")
    ),
    size: v.string(),
    condition: v.union(
      v.literal("new"),
      v.literal("excellent"),
      v.literal("good"),
      v.literal("fair")
    ),
    images: v.array(v.id("_storage")),
    pricePerDay: v.number(),
    depositAmount: v.number(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    }),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("items", {
      ...args,
      isAvailable: true,
      rating: 5.0,
      totalReviews: 0,
    });
  },
});

export const getItemsByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const getItem = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

export const searchItems = query({
  args: {
    category: v.optional(v.string()),
    maxDistance: v.optional(v.number()),
    userLatitude: v.optional(v.number()),
    userLongitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("items").withIndex("by_availability", (q) => q.eq("isAvailable", true));
    
    const items = await query.collect();
    
    // Filter by category if provided
    let filteredItems = items;
    if (args.category) {
      filteredItems = items.filter(item => item.category === args.category);
    }
    
    // Filter by distance if location provided
    if (args.userLatitude && args.userLongitude && args.maxDistance) {
      filteredItems = filteredItems.filter(item => {
        const distance = calculateDistance(
          args.userLatitude!,
          args.userLongitude!,
          item.location.latitude,
          item.location.longitude
        );
        return distance <= args.maxDistance!;
      });
    }
    
    return filteredItems;
  },
});

export const getFeaturedItems = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("items")
      .withIndex("by_availability", (q) => q.eq("isAvailable", true))
      .order("desc")
      .take(10);
  },
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}