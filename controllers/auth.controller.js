import bcryptjs from "bcryptjs";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";
import { Driver } from "../models/driver.model.js";

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	const { kind } = req.query;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}
		if (kind === "client") {
			const userAlreadyExists = await User.findOne({ email });
			console.log("userAlreadyExists", userAlreadyExists);

			if (userAlreadyExists) {
				return res.status(400).json({ success: false, message: "User already exists" });
			}

			const hashedPassword = await bcryptjs.hash(password, 10);
			const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

			const user = new User({
				email,
				password: hashedPassword,
				name,
				verificationToken,
				verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			});

			await user.save();

			// jwt
			generateTokenAndSetCookie(res, user._id);

			await sendVerificationEmail(user.email, verificationToken);

			res.status(201).json({
				success: true,
				message: "User created successfully",
				user: {
					...user._doc,
					password: undefined,
				},
			});
		}
		if (kind === "driver") {
			const driverAlreadyExists = await User.findOne({ email });

			if (driverAlreadyExists) {
				return res.status(400).json({ success: false, message: "User already exists" });
			}

			const hashedPassword = await bcryptjs.hash(password, 10);
			const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

			const driver = new Driver({
				email,
				password: hashedPassword,
				name,
				gender,
				birthday,
				phone,
				kindOfVehicle,
				verificationToken,
				verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			});

			await driver.save();

			// jwt
			generateTokenAndSetCookie(res, driver._id);

			await sendVerificationEmail(driver.email, verificationToken);

			res.status(201).json({
				success: true,
				message: "Driver created successfully",
				driver: {
					...driver._doc,
					password: undefined,
				},
			});
		}
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

function calculateAge(birthday) {
	const birthDate = new Date(birthday);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDifference = today.getMonth() - birthDate.getMonth();

	if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

cron.schedule('0 0 * * *', async () => {
	try {
		const users = await Driver.find();

		await Promise.all(users.map(async (user) => {
			user.age = calculateAge(user.birthday);
			await user.save();
		}));
	} catch (err) {
		console.error(err);
	}
});

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	const { kind } = req.query;
	try {
		if (kind === "client") {
			const user = await User.findOne({
				verificationToken: code,
				verificationTokenExpiresAt: { $gt: Date.now() },
			});

			if (!user) {
				return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
			}

			user.isVerified = true;
			user.verificationToken = undefined;
			user.verificationTokenExpiresAt = undefined;
			await user.save();

			await sendWelcomeEmail(user.email, user.name);

			res.status(200).json({
				success: true,
				message: "Email verified successfully",
				user: {
					...user._doc,
					password: undefined,
				},
			});
		}
		if (kind === "driver") {
			const driver = await Driver.findOne({
				verificationToken: code,
				verificationTokenExpiresAt: { $gt: Date.now() },
			});

			if (!driver) {
				return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
			}

			driver.isVerified = true;
			driver.verificationToken = undefined;
			driver.verificationTokenExpiresAt = undefined;
			await driver.save();

			await sendWelcomeEmail(driver.email, driver.name);

			res.status(200).json({
				success: true,
				message: "Email verified successfully",
				driver: {
					...driver._doc,
					password: undefined,
				},
			});
		}
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	const { kind } = req.query;
	try {
		if (kind === "client") {
			const user = await User.findOne({ email });
			if (!user) {
				return res.status(400).json({ success: false, message: "Invalid credentials" });
			}
			const isPasswordValid = await bcryptjs.compare(password, user.password);
			if (!isPasswordValid) {
				return res.status(400).json({ success: false, message: "Invalid credentials" });
			}

			generateTokenAndSetCookie(res, user._id);

			user.lastLogin = new Date();
			await user.save();

			res.status(200).json({
				success: true,
				message: "Logged in successfully",
				user: {
					...user._doc,
					password: undefined,
				},
			});
		}
		if (kind === "driver") {
			const driver = await Driver.findOne({ email });
			if (!driver) {
				return res.status(400).json({ success: false, message: "Invalid credentials" });
			}
			const isPasswordValid = await bcryptjs.compare(password, driver.password);
			if (!isPasswordValid) {
				return res.status(400).json({ success: false, message: "Invalid credentials" });
			}

			generateTokenAndSetCookie(res, driver._id);

			driver.lastLogin = new Date();
			await driver.save();

			res.status(200).json({
				success: true,
				message: "Logged in successfully",
				driver: {
					...driver._doc,
					password: undefined,
				},
			});
		}
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	const { kind } = req.query;
	try {
		if (kind === "client") {
			const user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ success: false, message: "User not found" });
			}

			// Generate reset token
			const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
			const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

			user.resetPasswordToken = resetToken;
			user.resetPasswordExpiresAt = resetTokenExpiresAt;

			await user.save();

			// send email
			await sendPasswordResetEmail(user.email, `Your OTP for resetting the password is: ${otp}`);

			res.status(200).json({ success: true, message: "Password reset link sent to your email" });
		}
		if (kind === "driver") {
			const driver = await Driver.findOne({ email });

			if (!driver) {
				return res.status(400).json({ success: false, message: "User not found" });
			}

			// Generate reset token
			const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
			const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

			driver.resetPasswordToken = resetToken;
			driver.resetPasswordExpiresAt = resetTokenExpiresAt;

			await driver.save();

			// send email
			await sendPasswordResetEmail(driver.email, `Your OTP for resetting the password is: ${otp}`);

			res.status(200).json({ success: true, message: "Password reset link sent to your email" });
		}
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token, password } = req.body;
		const { kind } = req.query;

		if (kind === "client") {
			const user = await User.findOne({
				resetPasswordToken: token,
				resetPasswordExpiresAt: { $gt: Date.now() },
			});

			if (!user) {
				return res.status(400).json({ success: false, message: "Invalid or expired reset OTP" });
			}

			// update password
			const hashedPassword = await bcryptjs.hash(password, 10);

			user.password = hashedPassword;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpiresAt = undefined;
			await user.save();

			await sendResetSuccessEmail(user.email);

			res.status(200).json({ success: true, message: "Password reset successful" });
		}
		if (kind === "driver") {
			const driver = await Driver.findOne({
				resetPasswordToken: token,
				resetPasswordExpiresAt: { $gt: Date.now() },
			});

			if (!driver) {
				return res.status(400).json({ success: false, message: "Invalid or expired reset OTP" });
			}

			// update password
			const hashedPassword = await bcryptjs.hash(password, 10);

			driver.password = hashedPassword;
			driver.resetPasswordToken = undefined;
			driver.resetPasswordExpiresAt = undefined;
			await driver.save();

			await sendResetSuccessEmail(driver.email);

			res.status(200).json({ success: true, message: "Password reset successful" });
		}
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};
