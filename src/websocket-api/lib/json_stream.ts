import { Duplex } from "stream";
import * as util from "util";

function SocketIOJSONStream(ws, io) {
  Duplex.call(this, { objectMode: true });
  this.ws = ws;
  this.io = io;
  const self = this;

  ws.on("sharedb", function(data) {
    console.log("received");
    self.push(JSON.parse(data));
  });

  ws.on("disconnect", function() {
    self.push(null);
    self.end();

    self.emit("close");
    self.emit("end");
  });

  this.on("error", function() {
    ws.disconnect(true);
  });

  this.on("end", function() {
    ws.disconnect(true);
  });
}
util.inherits(SocketIOJSONStream, Duplex);

SocketIOJSONStream.prototype.setRoom = function(room) {
  console.log("set room", room);
  this.room = room;
};

SocketIOJSONStream.prototype._read = function() {};
SocketIOJSONStream.prototype._write = function(msg, encoding, next) {
  this.ws.emit("sharedb", JSON.stringify(msg));
  // if (msg && msg.a === "init") {
  //   this.ws.emit("sharedb", JSON.stringify(msg));
  // } else {
  //   this.ws.broadcast.to(this.room).emit("sharedb", JSON.stringify(msg));
  // }
  next();
};

export default SocketIOJSONStream;
