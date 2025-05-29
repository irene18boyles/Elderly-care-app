export const config = {
  BACKEND_URL: 'http://localhost:8000',
  SOCKET_OPTIONS: {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  }
}; 