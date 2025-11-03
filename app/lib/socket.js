import { io } from "socket.io-client";

const socket = io("https://393rb0pp-5000.inc1.devtunnels.ms", {
  transports: ["websocket"],
});

export default socket;
