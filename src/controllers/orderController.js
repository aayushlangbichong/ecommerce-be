import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

export const createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.discountedPrice || item.product.price,
    }));

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const shippingAddress = req.body.shippingAddress;
    const note = req.body.note;

    const paymentMethod = req.body.payment?.method;
    const paymentId = req.body.payment?.paymentId;

    if (paymentMethod !== "cod" && !paymentId) {
      return res.status(400).json({
        error: `PaymentId is is required for method '${paymentMethod}'`,
      });
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      note,
      payment: {
        status:
          paymentMethod === "cod"
            ? "completed"
            : paymentId
            ? "completed"
            : "pending",
        method: paymentMethod,
        paymentId: paymentId,
      },
    });

    await order.save();
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = req.user.role === "admin" ? {} : { user: req.user._id };

    const totalCount = await Order.countDocuments(query);

    const orders =
      req.user.role === "admin"
        ? await Order.find(query)
            .populate([
              {
                path: "user",
                select: "-password",
              },
              {
                path: "items.product",
              },
            ])
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        : await Order.find({ ...query, user: req.user._id })
            .populate([
              {
                path: "user",
                select: "-password",
              },
              {
                path: "items.product",
              },
            ])
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

    res.json({
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (
      !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (
      req.user.role === "admin" ||
      ["pending", "processing"].includes(order.status)
    ) {
      await order.deleteOne();
      return res.json({ message: "Order deleted successfully" });
    } else {
      return res.status(400).json({
        error:
          "Order cannot be deleted unless it is in pending or processing status",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// function to cancel order if status is pending and is user's own order or is admin
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    console.log(order.user.toString());
    console.log(req.user._id.toString());

    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to cancel this order" });
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// it clears all users orders: use for dev purpose only to clean orders
export const clearOrders = async (req, res) => {
  try {
    // Delete all orders
    const result = await Order.deleteMany({});

    // Log the number of deleted documents
    console.log(`${result.deletedCount} orders were cleared.`);

    // Send a success response
    res.status(200).json({ message: "All orders have been cleared." });
  } catch (error) {
    // Handle any errors that occur during the deletion process
    console.error("An error occurred while clearing orders:", error);
    res.status(500).json({ error: "Failed to clear orders." });
  }
};
