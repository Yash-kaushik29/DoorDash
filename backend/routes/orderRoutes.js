const express = require("express");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const authenticateUser = require('../middleware/authMiddleware');

router.post("/create-order", async (req, res) => {
  const {
    userId,
    cartItems,
    paymentMethod,
    taxes = 0,
    convenienceFees = 0,
    serviceCharge = 0,
    address,
    paymentStatus,
    deliveryCharge = 0,
    orderType,
    cartKey,
  } = req.body;

  try {
    let subTotal = 0;
    let sellersNotified = [];

    // Create order items
    const orderItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.product).populate("seller");
        if (!product) throw new Error("Product not found");

        const sellerId = product.seller._id.toString();
        if (!sellersNotified.includes(sellerId)) sellersNotified.push(sellerId);

        subTotal += product.price * item.quantity;

        return {
          product: item.product,
          seller: sellerId,
          quantity: item.quantity,
        };
      })
    );

    // Calculate total amount
    const totalAmount =
      subTotal +
      deliveryCharge +
      (orderType === "Food" ? taxes + convenienceFees : serviceCharge);

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      shippingAddress: address,
      orderType,
      paymentMethod,
      totalAmount,
      amount: subTotal,
      taxes,
      convenienceFees,
      serviceCharge,
      deliveryStatus: "Processing",
      deliveryCharge,
      paymentStatus,
      sellersNotified,
    });

    await newOrder.save();

    // Clear the respective cart after order creation
    const updateCart = {
      $push: {
        notifications: {
          message: `Your order with order ID: #${newOrder.id} is processed.`,
          url: `/order/${newOrder._id}`,
        },
        orders: newOrder._id,
      },
    };
    updateCart[cartKey] = [];

    await User.findByIdAndUpdate(userId, updateCart);

    // Notify sellers
    await Promise.all(
      sellersNotified.map((sellerId) =>
        Seller.findByIdAndUpdate(sellerId, {
          $push: {
            notifications: {
              order: newOrder._id,
              message: `New order received. You need to prepare ${
                orderItems.filter((item) => item.seller === sellerId).length
              } items.`,
            },
            orders: newOrder._id,
          },
        })
      )
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/getOrderDetails/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findOne({ _id: id })
      .populate({
        path: "items.product",
        select: "name price shopName", // ✅ Fetch product details
      })
      .populate("user", "name email phone") // ✅ Fetch user details in a cleaner way
      .lean(); // ✅ Converts Mongoose document to plain object for better performance

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order!" });
  }
});

router.post("/submit-review", async (req, res) => {
  try {
    const { orderId, ratings, reviewText } = req.body;
    console.log(ratings);

    if (!orderId || !ratings) {
      return res.status(400).json({
        success: false,
        message: "Order ID and ratings are required.",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Check if already reviewed
    if (order.hasReviewed) {
      return res
        .status(400)
        .json({ success: false, message: "Order already reviewed." });
    }

    order.appRatings = ratings.appRatings;
    order.deliveryRatings = ratings.deliveryRatings;
    order.overallRatings = ratings.overallRatings;
    order.review = reviewText;
    order.hasReviewed = true;

    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Review submitted successfully!" });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Helper to handle page breaks
function checkPageSpace(doc, neededHeight = 50) {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
    doc.y = doc.page.margins.top;
  }
}

router.get("/download-invoice/:orderId", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.product").exec();
    if (!order) return res.status(404).send("Order not found");

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const fileName = `Invoice-${order._id}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(25).text("GullyFoods", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).text("Invoice", { align: "center" });
    doc.moveDown(1);

    // ===== ORDER SUMMARY =====
    const totalProducts = order.items.reduce((sum, item) => sum + item.quantity, 0);
    doc.fontSize(12)
      .text(`Order ID: #${order.id}`)
      .text(`Date & Time: ${order.createdAt.toLocaleString()}`)
      .text(`Products Count: ${totalProducts}`)
      .text(`Payment Method: ${order.paymentMethod}`);
    doc.moveDown();

    // ===== SHIPPING ADDRESS =====
    const addr = order.shippingAddress;
    doc.fontSize(12).text("Delivery Address:", { underline: true });
    doc.text(`${addr.fullName}`);
    doc.text(`${addr.phone}`);
    doc.text(`${addr.addressLine}, ${addr.area}${addr.landMark ? `, ${addr.landMark}` : ""}`);
    doc.moveDown();

    // ===== PRODUCTS TABLE =====
    const tableXStart = 50;
    const colNo = 50, colName = 90, colQty = 350, colTotal = 450;
    const colWidth = 100, colQtyWidth = 50;

    doc.fontSize(12).fillColor("#2e86de").text("Products", tableXStart, doc.y, { underline: true });
    doc.moveDown(0.3);

    // Table Header
    let headerY = doc.y;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#2e86de");
    doc.text("No", colNo, headerY, { width: 30 });
    doc.text("Name", colName, headerY, { width: 250 });
    doc.text("Qty", colQty, headerY, { width: colQtyWidth, align: "center" });
    doc.text("Total", colTotal, headerY, { width: colWidth, align: "right" });
    doc.moveDown(0.3);
    doc.strokeColor("#dcdde1").lineWidth(1).moveTo(colNo, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
    doc.moveDown(1.2);

    // Table Rows with page break
    doc.font("Helvetica").fontSize(10).fillColor("black");
    order.items.forEach((item, i) => {
      checkPageSpace(doc, 30); // Ensure row fits
      let rowY = doc.y;
      const name = item.product?.name || "Product";
      const qty = item.quantity;
      const totalPrice = item.product?.price ? item.product.price * qty : 0;

      doc.text(`${i + 1}`, colNo, rowY, { width: 30 });
      doc.text(name, colName, rowY, { width: 250 });
      doc.text(qty, colQty, rowY, { width: colQtyWidth, align: "center" });
      doc.text(`₹${totalPrice.toFixed(2)}`, colTotal, rowY, { width: colWidth, align: "right" });
      doc.moveDown(1.2);
    });

    doc.moveDown(0.5);

    // ===== PAYMENT & QR SECTION =====
    checkPageSpace(doc, 50); // Space for payment box 
    const paymentStartY = doc.y;

    // Light background box for payment summary
    const boxX = 45;
    const boxWidth = doc.page.width - 90;
    let boxHeight = 0;

    const itemsTotal = order.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
    const paymentLines = [];
    paymentLines.push({ label: "Items Total", value: `₹${itemsTotal.toFixed(2)}` });

    if (order.orderType === "Food") {
      paymentLines.push({ label: "Taxes", value: `₹${order.taxes.toFixed(2)}` });
      paymentLines.push({ label: "Convenience Fees", value: `₹${order.convenienceFees.toFixed(2)}` });
    } else if (order.orderType === "Grocery") {
      paymentLines.push({ label: "Service Charge", value: `₹${order.serviceCharge.toFixed(2)}` });
    }

    paymentLines.push({ label: "Delivery Charge", value: `₹${order.deliveryCharge.toFixed(2)}` });
    boxHeight = paymentLines.length * 20 + 40; // Space for TOTAL
    doc.rect(boxX, paymentStartY, boxWidth, boxHeight).fillAndStroke("#f5f6fa", "#dcdde1");

    // Inline payment lines
    let textY = paymentStartY + 15;
    const labelX = boxX + 15;
    doc.fontSize(12).font("Helvetica").fillColor("black");
    paymentLines.forEach(line => {
      doc.text(`${line.label}: ${line.value}`, labelX, textY);
      textY += 20;
    });

    // TOTAL
    doc.fontSize(14).font("Helvetica-Bold").text(`TOTAL: ₹${order.totalAmount.toFixed(2)}`, labelX, textY);
    doc.moveDown(1);

    
    // ===== QR CODE =====
    checkPageSpace(doc, 150); //Space for QR + text
    const orderUrl = `https://gullyfoods.app/order/${order._id}`;
    const qrDataUrl = await QRCode.toDataURL(orderUrl);

    const qrWidth = 120;
    const qrX = (doc.page.width - qrWidth) / 2;
    doc.image(qrDataUrl, qrX, doc.y + 10, { width: qrWidth });

    // Thank-you text
    doc.moveDown(8);
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#38D16B").text(
      "Thank you for ordering with GullyFoods!",
      { align: "center" }
    );
    doc.fontSize(10).font("Helvetica").fillColor("black").text(
      "We hope to serve you again soon!",
      { align: "center" }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/getOrder/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID);

        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        const order = await Order.findById(orderId)
          .populate("items.product", "name basePrice images")
          .lean(); // ✅ Using lean() for performance

        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order not found" });
        }

        const sellerProducts = order.items
          .filter(
            (item) => item.seller.toString() === existingSeller._id.toString()
          )
          .map((item) => ({
            _id: item.product._id,
            productName: item.product.name,
            price: item.product.basePrice,
            image: item.product.images[0],
            quantity: item.quantity,
            status: item.status,
          }));

        await Seller.updateOne(
          {
            _id: seller.sellerID,
            "notifications.order": orderId,
          },
          {
            $set: { "notifications.$.read": true },
          }
        );

        res.status(200).json({
          success: true,
          orderId: order.id,
          products: sellerProducts,
        });
      } catch (error) {
        console.error("Error fetching order:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.put("/confirm-order/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { selectedProducts } = req.body;
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        const existingSeller = await Seller.findById(seller.sellerID);
        if (!existingSeller) {
          return res
            .status(404)
            .json({ success: false, message: "Seller not found" });
        }

        // Populate products to access price
        const order = await Order.findById(orderId).populate("items.product");
        if (!order) {
          return res
            .status(404)
            .json({ success: false, message: "Order not found" });
        }

        let isUpdated = false;
        let cancelledAmount = 0;

        order.items.forEach((item) => {
          if (item.seller.toString() === seller.sellerID.toString()) {
            if (selectedProducts.includes(item.product._id.toString())) {
              item.status = "Preparing";
            } else {
              item.status = "Cancelled";
              cancelledAmount += (item.product?.price || 0) * item.quantity;
            }
            isUpdated = true;
          }
        });

        if (isUpdated) {
          order.amount = Math.max(0, (order.amount || 0) - cancelledAmount);
          await order.save();
        }

        res
          .status(200)
          .json({ success: true, message: "Order updated successfully" });
      } catch (error) {
        console.error("Error confirming order:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.get("/getAllOrders", async (req, res) => {
  const { sellerToken } = req.cookies;

  if (!sellerToken) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  jwt.verify(
    sellerToken,
    process.env.JWT_SECRET_KEY,
    {},
    async (err, seller) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Invalid token" });
      }

      try {
        // Fetch orders where the seller has at least one item
        const orders = await Order.find({ "items.seller": seller.sellerID })
          .populate("items.product", "id name price")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Filter items inside each order to include only those belonging to this seller
        const filteredOrders = orders.map((order) => ({
          ...order,
          items: order.items.filter(
            (item) => item.seller.toString() === seller.sellerID
          ),
        }));

        // Count total orders for pagination
        const totalOrders = await Order.countDocuments({
          "items.seller": seller.sellerID,
        });

        res.status(200).json({
          success: true,
          orders: filteredOrders,
          totalOrders,
          currentPage: page,
          totalPages: Math.ceil(totalOrders / limit),
        });
      } catch (error) {
        console.error("Error fetching seller orders:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal server error" });
      }
    }
  );
});

router.get("/getUserOrders", authenticateUser, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const existingUser = req.user;

    // Pagination logic
    const totalOrders = await Order.countDocuments({ user: existingUser._id });
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ user: existingUser._id })
      .populate({
        path: "items.product",
        select: "id name price",
      })
      .select("id items amount deliveryStatus createdAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      orders,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


module.exports = router;
