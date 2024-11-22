import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    payment: {
      status: {
        type: String,
        enum: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
      method: {
        type: String,
        enum: ["cod", "esewa", "khalti"],
        required: true,
      },
      paymentId: {
        type: String,
        // required if method is not cod (cash on delivery)
        required: function () {
          return this.payment.method !== "cod";
        },
      },
    },
    status: {
      type: String,
      enum: ["pending", "cancelled", "processing", "shipped", "delivered"],
      default: "pending",
    },
    shippingAddress: {
      addressLine1: {
        type: String,
        required: true,
      },
      addressLine2: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5,
      },
      country: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    note: {
      type: String,
      required: false,
      maxlength: 255,
    },
    cancelledReason: {
      type: String,
      required: false,
      maxlength: 255,
    },
    failedReason: {
      type: String,
      required: false,
      maxlength: 255,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
