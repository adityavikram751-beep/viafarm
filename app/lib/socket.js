import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://viafarm-1.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
