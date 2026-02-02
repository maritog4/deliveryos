/**
 * WebSocket Server para Notificaciones en Tiempo Real
 * 
 * Eventos:
 * - new_order: Nueva orden creada → notifica a admins
 * - order_assigned: Orden asignada → notifica a repartidor
 * - order_status_changed: Estado cambiado → notifica a cliente
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json()); // Para parsear JSON

const server = http.createServer(app);

// Configurar Socket.IO con CORS
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['polling', 'websocket'], // Polling primero, luego upgrade
  allowEIO3: true,
  upgradeTimeout: 10000,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Conexión a base de datos
const dbConfig = {
  host: 'localhost',
  user: 'deliverysv_user',
  password: 'HJ1y09Uo9He6qu9EU8Sxi3Wf',
  database: 'deliverysv'
};

// Almacenar conexiones por usuario
const connections = {
  admins: new Map(),      // userId -> socket
  drivers: new Map(),     // userId -> socket
  customers: new Map()    // userId -> socket
};

io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Registrar usuario cuando se conecta
  socket.on('register', (data) => {
    const { userId, role } = data;
    
    console.log(`✅ Usuario registrado: ${userId} (${role})`);
    
    if (role === 'admin') {
      connections.admins.set(userId, socket.id);
    } else if (role === 'driver') {
      connections.drivers.set(userId, socket.id);
    } else if (role === 'customer') {
      connections.customers.set(userId, socket.id);
    }

    socket.userId = userId;
    socket.userRole = role;
  });

  // Evento: Nueva orden creada
  socket.on('new_order', async (orderData) => {
    console.log('📦 Nueva orden:', orderData.order_number);
    
    // Notificar a TODOS los admins
    connections.admins.forEach((socketId) => {
      io.to(socketId).emit('notification', {
        type: 'new_order',
        title: '🆕 Nueva Orden',
        message: `Orden #${orderData.order_number} de ${orderData.customer_name}`,
        data: orderData,
        timestamp: new Date().toISOString()
      });
    });
    
    console.log(`✅ Notificado a ${connections.admins.size} admin(s)`);
  });

  // Evento: Orden asignada a repartidor
  socket.on('order_assigned', async (data) => {
    const { orderId, driverId, orderNumber, customerName } = data;
    
    console.log(`🚚 Orden ${orderNumber} asignada a driver ${driverId}`);
    
    // Notificar al repartidor específico
    const driverSocketId = connections.drivers.get(driverId.toString());
    
    if (driverSocketId) {
      io.to(driverSocketId).emit('notification', {
        type: 'order_assigned',
        title: '🚚 Nueva Orden Asignada',
        message: `Se te asignó la orden #${orderNumber} de ${customerName}`,
        data: { orderId, orderNumber, customerName },
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Notificado a repartidor ${driverId}`);
    } else {
      console.log(`⚠️ Repartidor ${driverId} no está conectado`);
    }
  });

  // Evento: Estado de orden cambiado
  socket.on('order_status_changed', async (data) => {
    const { orderId, orderNumber, status, customerId } = data;
    
    console.log(`📊 Orden ${orderNumber} cambió a: ${status}`);
    
    // Mapeo de estados a mensajes amigables
    const statusMessages = {
      'pending': 'Tu pedido está pendiente de confirmación',
      'confirmed': '✅ Tu pedido fue confirmado',
      'preparing': '👨‍🍳 Tu pedido está siendo preparado',
      'ready': '📦 Tu pedido está listo para entregar',
      'picked_up': '🚗 El repartidor recogió tu pedido',
      'on_the_way': '🚚 Tu pedido está en camino',
      'delivered': '✅ Tu pedido fue entregado',
      'cancelled': '❌ Tu pedido fue cancelado'
    };
    
    // Notificar al cliente específico
    const customerSocketId = connections.customers.get(customerId.toString());
    
    if (customerSocketId) {
      io.to(customerSocketId).emit('notification', {
        type: 'order_status_changed',
        title: `Actualización de Orden #${orderNumber}`,
        message: statusMessages[status] || `Estado: ${status}`,
        data: { orderId, orderNumber, status },
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Notificado a cliente ${customerId}`);
    } else {
      console.log(`⚠️ Cliente ${customerId} no está conectado`);
    }
    
    // También notificar a admins
    connections.admins.forEach((socketId) => {
      io.to(socketId).emit('order_update', {
        orderId,
        orderNumber,
        status
      });
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
    
    // Remover de las conexiones
    if (socket.userId && socket.userRole) {
      if (socket.userRole === 'admin') {
        connections.admins.delete(socket.userId);
      } else if (socket.userRole === 'driver') {
        connections.drivers.delete(socket.userId);
      } else if (socket.userRole === 'customer') {
        connections.customers.delete(socket.userId);
      }
    }
  });
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: {
      admins: connections.admins.size,
      drivers: connections.drivers.size,
      customers: connections.customers.size
    },
    timestamp: new Date().toISOString()
  });
});

// Endpoint para emitir eventos desde PHP
app.post('/emit', (req, res) => {
  const { event, data } = req.body;
  
  if (!event || !data) {
    return res.status(400).json({ error: 'Missing event or data' });
  }
  
  console.log(`📡 Recibido evento desde PHP: ${event}`);
  
  // Emitir el evento al socket correspondiente
  switch (event) {
    case 'new_order':
      // Notificar a todos los admins
      connections.admins.forEach((socketId) => {
        io.to(socketId).emit('notification', {
          type: 'new_order',
          title: '🆕 Nueva Orden',
          message: `Orden #${data.order_number} de ${data.customer_name}`,
          data: data,
          timestamp: new Date().toISOString()
        });
      });
      break;
      
    case 'order_assigned':
      // Notificar al repartidor específico
      const driverSocketId = connections.drivers.get(data.driverId.toString());
      if (driverSocketId) {
        io.to(driverSocketId).emit('notification', {
          type: 'order_assigned',
          title: '🚚 Nueva Orden Asignada',
          message: `Se te asignó la orden #${data.orderNumber} de ${data.customerName}`,
          data: data,
          timestamp: new Date().toISOString()
        });
      }
      break;
      
    case 'order_status_changed':
      // Notificar al cliente específico
      const statusMessages = {
        'pending': 'Tu pedido está pendiente de confirmación',
        'confirmed': '✅ Tu pedido fue confirmado',
        'preparing': '👨‍🍳 Tu pedido está siendo preparado',
        'ready': '📦 Tu pedido está listo para entregar',
        'picked_up': '🚗 El repartidor recogió tu pedido',
        'on_the_way': '🚚 Tu pedido está en camino',
        'delivered': '✅ Tu pedido fue entregado',
        'cancelled': '❌ Tu pedido fue cancelado'
      };
      
      const customerSocketId = connections.customers.get(data.customerId.toString());
      if (customerSocketId) {
        io.to(customerSocketId).emit('notification', {
          type: 'order_status_changed',
          title: `Actualización de Orden #${data.orderNumber}`,
          message: statusMessages[data.status] || `Estado: ${data.status}`,
          data: data,
          timestamp: new Date().toISOString()
        });
      }
      break;
  }
  
  res.json({ success: true, message: 'Event emitted' });
});

const PORT = process.env.WS_PORT || 3001;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🚀 WebSocket Server - Notificaciones en Tiempo Real     ║
╚════════════════════════════════════════════════════════════╝

📡 Servidor corriendo en: http://localhost:${PORT}
🔌 Socket.IO listo en: ws://localhost:${PORT}
💚 Health check: http://localhost:${PORT}/health

Eventos disponibles:
  📦 new_order          - Nueva orden creada
  🚚 order_assigned     - Orden asignada a repartidor
  📊 order_status_changed - Estado de orden cambió

  `);
});
