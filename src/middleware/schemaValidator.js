const validateSchema = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      errors: err?.errors?.map(({ path, code, message }) => ({
        path: path?.[0],
        message,
        code,
      })),
    });
  }
};

export default validateSchema;
