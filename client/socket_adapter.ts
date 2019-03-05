import * as SocketIOClient from "socket.io-client";

enum STATE {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED
}
class SocketAdapter {
  private socket: SocketIOClient.Socket;
  readyState: STATE;

  constructor(public url: string, auth?) {
    this.readyState = STATE.CONNECTING;
    this.socket = SocketIOClient.connect(url);
    console.log("connecting");

    this.socket.on("connect", () => {
      this.readyState = STATE.OPEN;
      console.log("connected");
    });

    this.socket.on("disconnect", reason => {
      this.readyState = STATE.CLOSED;
      if (reason === "transport closed") {
        this.onclose("stopped");
      } else {
        this.onclose("closed");
      }
    });
  }

  onclose(event) {
    console.log("CLOSED", { event });
  }
}

export default SocketAdapter;
