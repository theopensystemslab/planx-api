import * as SocketIOClient from "socket.io-client";

function log(...messages: any): void {
  if (process.env.DEBUG) {
    console.log(messages);
  }
}

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
    log("connecting");

    this.socket.on("connect", () => {
      this.readyState = STATE.OPEN;
      log("connected");
    });

    this.socket.on("reconnect", () => {
      this.readyState = STATE.OPEN;
      log("reconnected");
    });

    this.socket.on("reconnecting", () => {
      this.readyState = STATE.CONNECTING;
      log("reconnecting");
    });

    this.socket.on("logout", () => {
      auth.logout();
      log("logout");
    });

    this.socket.on("disconnect", reason => {
      this.readyState = STATE.CLOSED;
      if (reason === "transport closed") {
        this.onclose("stopped");
        log("disconnected: stopped");
      } else {
        this.onclose("closed");
        log("disconnected: closed");
      }
    });
  }

  join(room, cb) {
    this.socket.emit("join", { room }, cb);
    log("joined room", room);
  }

  leave(room, cb) {
    this.socket.emit("leave", { room }, cb);
    log("left room", room);
  }

  close(code = 1005, reason?: string) {
    log("close socket", { code, reason });
    // this.socket.disconnect(code, reason)
    this.socket.disconnect();
  }

  onclose(event) {
    log("closed socket", { event });
  }

  send(message) {
    this.socket.emit("sharedb", message);
    log("send message", message);
  }

  onopen(event) {
    log("opened socket", event);
  }

  onerror(event) {
    log("error", event);
  }

  onmessage(event) {
    log("received message", event);
  }
}

export default SocketAdapter;
