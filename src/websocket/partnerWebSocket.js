const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { Partner } = require('../models');

class PartnerWebSocketServer {
  constructor() {
    this.wss = null;
    this.partners = new Map(); // Store connected partners
  }

  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: '/partner'
    });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('Partner WebSocket server initialized');
  }

  handleConnection(ws, req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    console.log('WebSocket connection attempt');
    console.log('Token received:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    if (!token) {
      console.log('WebSocket connection rejected: No token provided');
      ws.close(1008, 'Token required');
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('WebSocket JWT decoded:', JSON.stringify(decoded, null, 2));

      // Extract partner ID - handle different JWT structures
      const partnerId = decoded.partnerId || decoded.id || decoded._id;

      if (!partnerId) {
        console.error('No partner ID found in token:', decoded);
        ws.close(1008, 'Invalid token structure');
        return;
      }

      console.log(`Partner ${partnerId} attempting to connect via WebSocket`);

      // Store partner connection
      this.partners.set(partnerId, ws);

      ws.on('message', (data) => {
        this.handleMessage(ws, data, partnerId);
      });

      ws.on('close', () => {
        this.partners.delete(partnerId);
        console.log(`Partner ${partnerId} disconnected`);
      });

      // Send initial data with actual bookings
      this.sendInitialData(ws, partnerId);

      console.log(`Partner ${partnerId} connected via WebSocket`);
    } catch (error) {
      console.error('WebSocket authentication error:', error.message);
      console.error('Token that failed:', token ? `${token.substring(0, 50)}...` : 'NO TOKEN');
      ws.close(1008, 'Invalid token');
    }
  }

  handleMessage(ws, data, partnerId) {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Send initial booking data to partner
  async sendInitialData(ws, partnerId) {
    try {
      const ServiceBooking = require('../models/urban-services/serviceBooking');

      console.log(`Fetching bookings for partner: ${partnerId}`);

      // Find partner's assigned bookings (status: pending, accepted, in_progress, on_the_way)
      const myBookings = await ServiceBooking.find({
        partner: partnerId,
        status: { $in: ['pending', 'accepted', 'in_progress', 'on_the_way'] }
      })
        .populate('customer', 'name phone')
        .populate('category', 'name')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

      console.log(`Found ${myBookings.length} assigned bookings for partner ${partnerId}`);

      // Find available bookings (no partner assigned, status: pending)
      const availableBookings = await ServiceBooking.find({
        partner: null,
        status: 'pending'
      })
        .populate('customer', 'name phone')
        .populate('category', 'name')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

      console.log(`Found ${availableBookings.length} available bookings`);

      ws.send(JSON.stringify({
        type: 'INITIAL_DATA',
        available: availableBookings,
        accepted: myBookings
      }));

      console.log('Initial data sent to partner');
    } catch (error) {
      console.error('Error sending initial data:', error);
      ws.send(JSON.stringify({
        type: 'INITIAL_DATA',
        available: [],
        accepted: []
      }));
    }
  }

  // Send booking updates to all partners
  broadcastToAll(type, data) {
    const message = JSON.stringify({ type, data });

    this.partners.forEach((ws, partnerId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  // Send booking update to specific partner
  sendToPartner(partnerId, type, data) {
    const ws = this.partners.get(partnerId.toString());

    console.log(`sendToPartner called - Partner ID: ${partnerId}, Type: ${type}, Connected: ${!!ws}`);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, ...data }));
      console.log(`Message sent to partner ${partnerId}`);
    } else {
      console.log(`Partner ${partnerId} not connected or WebSocket not open`);
    }
  }

  // Send new booking to all available partners
  sendNewBooking(booking) {
    this.broadcastToAll('NEW_BOOKING', booking);
  }

  // Send booking update
  sendBookingUpdate(booking) {
    console.log('sendBookingUpdate called for booking:', booking._id);
    console.log('Booking partner:', booking.partner);

    // Extract partner ID (handle both populated and non-populated partner field)
    const partnerId = booking.partner?._id || booking.partner;

    if (partnerId) {
      console.log(`Sending update to specific partner: ${partnerId}`);
      this.sendToPartner(partnerId.toString(), 'BOOKING_UPDATED', { booking });
    } else {
      console.log('No partner assigned, broadcasting to all');
    }

    // Also broadcast to all partners so they can update their available bookings list
    console.log('Broadcasting to all partners');
    this.broadcastToAll('BOOKING_UPDATED', { booking });
  }

  // Send booking cancellation
  sendBookingCancellation(bookingId) {
    this.broadcastToAll('BOOKING_CANCELLED', { bookingId });
  }
}

// Create singleton instance
const partnerWebSocket = new PartnerWebSocketServer();

module.exports = partnerWebSocket;
