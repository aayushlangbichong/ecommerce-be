const imageValidator = (config) => (req, res, next) => {
  const maxSizeInMB = config?.maxSizeInMB || 5;
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.file;
  const fileSizeInMB = file.size / (1024 * 1024);
  const allowedFileTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedFileTypes.includes(file.mimetype)) {
    return res.status(400).json({
      error: "Invalid file type. Only JPEG, PNG, and GIF are allowed",
    });
  }

  if (fileSizeInMB > maxSizeInMB) {
    return res
      .status(400)
      .json({ error: `File size exceeds the limit of ${maxSizeInMB} MB` });
  }

  next();
};

export default imageValidator;
