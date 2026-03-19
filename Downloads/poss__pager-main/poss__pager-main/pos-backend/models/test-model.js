const productModel = require("./productModel");

async function test() {
  try {
    const result = await productModel.addProduct("Test Product", 100, 10);
    console.log("Inserted:", result.insertId);

    const products = await productModel.getAllProducts();
    console.log("All products:", products);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
