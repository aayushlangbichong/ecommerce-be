import Image from "../models/Image.js";

import {
  uploadImage as imgurUploadImage,
  deleteImage as imgurDeleteImage,
} from "../services/imgurService.js";

export const uploadImage = async (req, res) => {
  try {
    const { albumId, altText, tags } = req.body;
    const imageBuffer = req.file.buffer;

    const imgurResponse = await imgurUploadImage(imageBuffer);

    const image = new Image({
      albumId,
      imgurId: imgurResponse.id,
      imgurUrl: imgurResponse.link,
      imgurDeleteHash: imgurResponse.deletehash,
      altText,
      tags: tags.split(",").map((tag) => tag.trim()),
    });

    await image.save();
    res.status(201).json({ image, imgurResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getImagesByAlbum = async (req, res) => {
  try {
    const images = await Image.find({ albumId: req.params.albumId });

    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message, obj: error });
  }
};

export const searchImagesByTag = async (req, res) => {
  try {
    const { tag } = req.query;
    const images = await Image.find({ tags: tag });
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Image not found" });

    await imgurDeleteImage(image?.imgurDeleteHash);
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getImages = async (req, res) => {
  try {
    const { page = 1, limit = 10, tags, altText, albumIds } = req.query;

    // Build filter query
    const filter = {};

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Filter by alt text (case-insensitive partial match)
    if (altText) {
      filter.altText = { $regex: altText, $options: "i" };
    }

    // Filter by album IDs
    if (albumIds) {
      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      let albumIdArray = albumIds
        .split(",")
        .map((id) => id.trim())
        .filter(isValidObjectId);

      if (albumIdArray.length === 0) {
        return res.json({
          images: [],
          pagination: {
            totalImages: 0,
            limit: parseInt(limit),
            currentPage: parseInt(page),
            totalPages: 0,
          },
        });
      }
      albumIdArray = albumIds.split(",").map((id) => id.trim());
      filter.albumId = { $in: albumIdArray };
    }

    // Calculate pagination
    const currentPage = parseInt(page);
    const perPage = parseInt(limit);
    const skip = (currentPage - 1) * perPage;

    // Execute query with pagination
    const [images, totalImages] = await Promise.all([
      Image.find(filter).skip(skip).limit(perPage).sort({ createdAt: -1 }),
      Image.countDocuments(filter),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalImages / perPage);

    res.json({
      images,
      pagination: {
        totalImages,
        limit: perPage,
        currentPage,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
