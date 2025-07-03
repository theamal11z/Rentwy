import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    }),
    isVerified: v.boolean(),
    rating: v.number(),
    totalReviews: v.number(),
    joinedAt: v.number(),
  })
    .index("by_email", ["email"]),

  items: defineTable({
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
    isAvailable: v.boolean(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    }),
    tags: v.array(v.string()),
    rating: v.number(),
    totalReviews: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_category", ["category"])
    .index("by_availability", ["isAvailable"]),

  bookings: defineTable({
    itemId: v.id("items"),
    renterId: v.id("users"),
    ownerId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
    totalDays: v.number(),
    totalPrice: v.number(),
    depositAmount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("disputed")
    ),
    paymentIntentId: v.optional(v.string()),
    depositReleased: v.boolean(),
    pickupMethod: v.union(v.literal("pickup"), v.literal("delivery")),
    notes: v.optional(v.string()),
  })
    .index("by_item", ["itemId"])
    .index("by_renter", ["renterId"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  messages: defineTable({
    bookingId: v.id("bookings"),
    senderId: v.id("users"),
    receiverId: v.id("users"),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("system")),
    isRead: v.boolean(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_sender", ["senderId"])
    .index("by_receiver", ["receiverId"]),

  reviews: defineTable({
    bookingId: v.id("bookings"),
    reviewerId: v.id("users"),
    revieweeId: v.id("users"),
    itemId: v.id("items"),
    rating: v.number(),
    comment: v.string(),
    type: v.union(v.literal("item"), v.literal("user")),
    aspects: v.object({
      condition: v.optional(v.number()),
      communication: v.optional(v.number()),
      timeliness: v.optional(v.number()),
    }),
  })
    .index("by_booking", ["bookingId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_reviewee", ["revieweeId"])
    .index("by_item", ["itemId"]),

  unavailableDates: defineTable({
    itemId: v.id("items"),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.union(v.literal("booked"), v.literal("maintenance"), v.literal("owner_blocked")),
  })
    .index("by_item", ["itemId"]),
});