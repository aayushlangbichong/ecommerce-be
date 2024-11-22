import Product from "../models/Product.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  try {
    console.log(req.body.thumbnail);

    const product = new Product(req.body);

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category } = req.query;

    const query = {
      title: { $regex: search, $options: "i" },
    };

    if (category) {
      query.category = { $in: [category] };
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate(["category", "pictures", "thumbnail"])
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate([
      "category",
      "pictures",
      "thumbnail",
    ]);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Manage recent viewed products cookie
    let recentViewedProducts = req.cookies.recentViewedProducts
      ? JSON.parse(req.cookies.recentViewedProducts || "[]")
      : {};

    // Add current product, limit to 5 most recent unique products
    recentViewedProducts[product._id] = {
      id: product._id,
      tags: product.tags,
      timestamp: Date.now(),
    };

    // Sort products by timestamp and keep only 5 most recent
    const sortedProducts = Object.values(recentViewedProducts)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    const updatedRecentViewedProducts = Object.fromEntries(
      sortedProducts.map((product) => [product.id, product])
    );

    res.cookie(
      "recentViewedProducts",
      JSON.stringify(updatedRecentViewedProducts),
      {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict",
      }
    );

    // // Manage recent viewed tags cookie
    // let recentTags =
    //   req.cookies?.recentViewedTags || "[]"
    //     ? JSON.parse(req.cookies.recentViewedTags || "[]")
    //     : [];

    // // Add product tags, remove duplicates, limit to last 5 unique tags
    // const updatedRecentTags = Array.from(
    //   new Set([...product.tags, ...recentTags])
    // ).slice(0, 5);

    // res.cookie("recentViewedTags", JSON.stringify(updatedRecentTags), {
    //   httpOnly: false,
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate([
      "category",
      "pictures",
      "thumbnail",
    ]);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProductsByTags = async (req, res) => {
  try {
    // Extract tags, excluded IDs, and other optional query parameters
    const { tags, excludeIds, page = 1, limit = 10 } = req.query;

    // Validate input
    if (!tags) {
      return res.status(400).json({
        message: "At least one tag is required",
      });
    }

    // Convert tags and excludeIds to arrays
    const _tagArray = Array.isArray(tags) ? tags : [tags];
    const tagArray = _tagArray?.map((tag) => tag?.trim());

    const excludeIdArray = excludeIds
      ? Array.isArray(excludeIds)
        ? excludeIds
        : [excludeIds]
      : [];

    // Construct query
    const query = {
      tags: { $in: tagArray },
      ...(excludeIdArray.length > 0 && {
        _id: {
          $nin: excludeIdArray.map((id) => new mongoose.Types.ObjectId(id)),
        },
      }),
    };

    // Find products with pagination and filtering
    const products = await Product.find(query)
      .populate("category")
      .populate("thumbnail")
      .populate("pictures")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Count total matching products
    const totalProducts = await Product.countDocuments(query);

    // If no products found
    if (products.length === 0) {
      return res.status(404).json({
        message: "No products found with the specified tags",
      });
    }

    // Return found products with pagination metadata
    res.status(200).json({
      count: products.length,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  } catch (error) {
    console.error("Error fetching products by tags:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
