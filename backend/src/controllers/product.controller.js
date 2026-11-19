const productService = require("../services/product.service");

// ================= GET ALL PRODUCTS =================
exports.getAll = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.json({
      success: true,
      data: products
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= CREATE PRODUCT =================
exports.create = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= UPDATE PRODUCT =================
exports.update = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// ================= DELETE PRODUCT =================
exports.remove = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};