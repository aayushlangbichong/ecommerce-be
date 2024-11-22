import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: false,
      },
    ],
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    pictures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
        required: false,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
    },
    slug: {
      type: String,
      required: false,
      unique: true,
    },
    tags: [
      {
        type: String,
        required: false,
      },
    ],
  },
  { timestamps: true }
);

productSchema.pre("save", async function (next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/ /g, "-");
  }

  const existingProduct = await mongoose.models.Product.findOne({
    slug: this.slug,
  });
  if (existingProduct) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    this.slug = `${this.slug}-${uniqueSuffix}`;
  }

  next();
});

export default mongoose.model("Product", productSchema);
