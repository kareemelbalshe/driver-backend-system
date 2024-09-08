import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		client: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Driver",
			required: true,
		},
		vehicle: {
			type: String,
		},
        date: {
            type: Date,
            default: Date.now,
        },
        from: {
            type: String,
        },
        to: {
            type: String,
        },
		price: {
			type: Number,
			required: true,
		},
        status: {
            type: String,
            default: "pending",
            enum: ["pending", "accepted", "completed", "cancelled"],
        },
	},
	{ timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
