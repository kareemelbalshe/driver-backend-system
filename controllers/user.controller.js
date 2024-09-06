import { Driver } from "../models/driver.model";
import { User } from "../models/user.model";

export const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json({ success: true, drivers });
    } catch (error) {
        console.log("Error in getAllDrivers ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ success: true, users });
    } catch (error) {
        console.log("Error in getAllUsers ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in getUserProfile ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getDriverProfile = async (req, res) => {
    try {
        const driver = await Driver.findById(req.userId).select("-password");
        if (!driver) {
            return res.status(400).json({ success: false, message: "Driver not found" });
        }
        res.status(200).json({ success: true, driver });
    } catch (error) {
        console.log("Error in getDriverProfile ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateDriverProfile = async (req, res) => {
    try {
        const { name, gender, birthday, phone, kindOfVehicle } = req.body;

        const driver = await Driver.findById(req.userId);
        if (!driver) {
            return res.status(400).json({ success: false, message: "Driver not found" });
        }

        driver.name = name;
        driver.gender = gender;
        driver.birthday = birthday;
        driver.phone = phone;
        driver.kindOfVehicle = kindOfVehicle;

        await driver.save();

        res.status(200).json({ success: true, message: "Driver profile updated successfully" });
    } catch (error) {
        console.log("Error in updateDriverProfile ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.userId);

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.log("Error in deleteUser ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteDriver = async (req, res) => {
    try {
        await Driver.findByIdAndDelete(req.userId);

        res.status(200).json({ success: true, message: "Driver deleted successfully" });
    } catch (error) {
        console.log("Error in deleteDriver ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const searchAboutDriver = async (req, res) => {
    try {
        const { name } = req.body;
        const drivers = await Driver.find({
            name: { $regex: name, $options: "i" },
        }).select("-password");
        if (!drivers) {
            return res.status(400).json({ success: false, message: "Driver not found" });
        }
        res.status(200).json({ success: true, drivers });
    } catch (error) {
        console.log("Error in searchAboutDriver ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ status: "available" });
        res.status(200).json({ success: true, drivers });
    } catch (error) {
        console.log("Error in getAvailableDrivers ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const setAvailableDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.userId);
        if (!driver) {
            return res.status(400).json({ success: false, message: "Driver not found" });
        }

        driver.status = "available";

        await driver.save();

        res.status(200).json({ success: true, message: "Driver status updated successfully" });
    } catch (error) {
        console.log("Error in setAvailableDriver ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const setUnavailableDriver = async (req, res) => {
    try {
        const driver = await Driver.findById(req.userId);
        if (!driver) {
            return res.status(400).json({ success: false, message: "Driver not found" });
        }

        driver.status = "unavailable";

        await driver.save();

        res.status(200).json({ success: true, message: "Driver status updated successfully" });
    } catch (error) {
        console.log("Error in setUnavailableDriver ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};