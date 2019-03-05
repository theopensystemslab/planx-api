import { Duplex } from "stream";

class JsonStream extends Duplex {
  public room;

  constructor(private ws, io) {
    super(ws);
    this._write = this._write.bind(this);

    Duplex.call(this, { objectMode: true });

    ws.on("disconnect", () => {
      this.push(null);
      this.end();

      this.emit("close");
      this.emit("end");
    });

    this.on("error", () => {
      ws.disconnect(true);
    });

    this.on("end", () => {
      ws.disconnect(true);
    });
  }

  _read() {}

  _write(msg, _encoding, next): void {
    this.ws.emit("sharedb", JSON.stringify(msg));
    next();
  }
}

export default JsonStream;

// util.inherits(JsonStream, Duplex)
