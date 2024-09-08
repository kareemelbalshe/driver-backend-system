import { Driver } from "../models/driver.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

export const createOrder = async (req, res) => {
    try {
        const order = new Order({
            client: req.userId,
            driver: req.params.driver,
            from: req.body.from,
            to: req.body.to,
            date: req.body.date,
        });

        await order.save();

        const client = await User.findById(req.userId);
        client.trips.push(order._id);
        await client.save();

        const driver = await User.findById(req.params.driver);
        driver.trips.push(order._id);
        await driver.save();

        res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ $or: [{ client: req.userId }, { driver: req.userId }] });

        res.status(200).json({
            message: "Orders retrieved successfully",
            orders,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.status(200).json({
            message: "Order retrieved successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

export const acceptOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Order is already accepted",
            });
        }

        order.status = "accepted";
        order.price = req.body.price;

        await order.save();

        res.status(200).json({
            message: "Order accepted successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Order is already cancelled",
            });
        }

        order.status = "cancelled";

        await order.save();

        res.status(200).json({
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

export const completeOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        if (order.status !== "accepted") {
            return res.status(400).json({
                message: "Order is not accepted",
            });
        }

        order.status = "completed";

        await order.save();

        res.status(200).json({
            message: "Order completed successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error,
        });
    }
};

cron.schedule('0 0 * * *', async () => {
    try {
        const orders = await Order.find({ status: "pending" });

        await Promise.all(orders.map(async (order) => {
            const oneDay = 24 * 60 * 60 * 1000;
            const timeSinceCreation = new Date() - new Date(order.createdAt);

            if (timeSinceCreation > oneDay) {
                const id = order._id;

                const [client, driver] = await Promise.all([
                    User.findById(order.client),
                    Driver.findById(order.driver)
                ]);

                if (client && driver) {
                    client.trips.pull(id);
                    driver.trips.pull(id);

                    await Promise.all([
                        client.save(),
                        driver.save(),
                        Order.findByIdAndDelete(id)
                    ]);

                    console.log(`Order with ID ${id} has been deleted.`);
                }
            }
        }));
    } catch (err) {
        console.error(err);
    }
});

cron.schedule('0 0 * * *', async () => {
    try {
        const orders = await Order.find();

        await Promise.all(orders.map(async (order) => {
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const timeSinceCreation = new Date() - new Date(order.createdAt);

            if (timeSinceCreation > oneWeek) {
                const id = order._id;

                const [client, driver] = await Promise.all([
                    User.findById(order.client),
                    Driver.findById(order.driver)
                ]);

                if (client && driver) {
                    client.trips.pull(id);
                    driver.trips.pull(id);

                    await Promise.all([
                        client.save(),
                        driver.save(),
                        Order.findByIdAndDelete(id)
                    ]);

                    console.log(`Order with ID ${id} has been deleted.`);
                }
            }
        }));
    } catch (err) {
        console.error(err);
    }
});