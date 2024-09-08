import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
        gender: {
            type: String,
            required: true,
        },
        age: {
            type: Number,
        },
        birthday: {
            type: Date,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        kindOfVehicle: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: "available",
            enum: ["available", "unavailable"],
        },
		trips: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
			},
		],
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
	},
	{ timestamps: true }
);

export const Driver = mongoose.model("Driver", driverSchema);
