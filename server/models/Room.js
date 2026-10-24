const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [2, "Room name must be at least 2 characters"],
      maxlength: [50, "Room name must be at most 50 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [200, "Description must be at most 200 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Denormalize member count for quick listing
roomSchema.virtual("memberCount").get(function () {
  return this.members.length;
});

roomSchema.set("toJSON", { virtuals: true });
roomSchema.set("toObject", { virtuals: true });

roomSchema.index({ name: 1 });

module.exports = mongoose.model("Room", roomSchema);
