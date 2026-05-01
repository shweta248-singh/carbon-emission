const Notification = require('../models/Notification');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const asyncHandler = require('express-async-handler');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Check for Low Stock (Dynamic Creation)
  const lowStockItems = await Inventory.find({ user: userId, quantity: { $lt: 10 } });
  for (const item of lowStockItems) {
    const exists = await Notification.findOne({ 
      user: userId, 
      type: 'low_stock', 
      relatedId: item._id.toString(),
      isRead: false 
    });
    if (!exists) {
      await Notification.create({
        user: userId,
        title: 'low_stock_alert',
        message: `${item.productName} is running low (${item.quantity} units left).`,
        type: 'low_stock',
        relatedId: item._id.toString()
      });
    }
  }

  // 2. Check for Pending Shipments (Dynamic Creation)
  const pendingShipments = await Shipment.find({ user: userId, status: 'Pending' });
  for (const ship of pendingShipments) {
     const exists = await Notification.findOne({
       user: userId,
       type: 'shipment_pending',
       relatedId: ship._id.toString(),
       isRead: false
     });
     if (!exists) {
       await Notification.create({
         user: userId,
         title: 'pending_shipment',
         message: `Shipment from ${ship.origin} to ${ship.destination} is pending.`,
         type: 'shipment_pending',
         relatedId: ship._id.toString()
       });
     }
  }

  // Fetch all notifications (limit to last 20)
  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: notifications
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getNotifications,
  markAllAsRead
};
