const EVENTS = require('./events');

const initSocketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('✅ Socket connected:', socket.id);

    // Frontend calls this after login to join personal room
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('join:task', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    // Simple test event
    socket.on('ping', () => {
      socket.emit('pong', { message: 'Socket is working!' });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};

module.exports = initSocketHandler;