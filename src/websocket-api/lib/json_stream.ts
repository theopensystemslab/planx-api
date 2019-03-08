import { Duplex } from 'stream'
import * as util from 'util'

function SocketIOJSONStream(ws, io) {
  Duplex.call(this, { objectMode: true })
  this.ws = ws
  this.io = io

  ws.on('sharedb', data => {
    console.log('received')
    this.push(JSON.parse(data))
  })

  ws.on('disconnect', () => {
    this.push(null)
    this.end()

    this.emit('close')
    this.emit('end')
  })

  this.on('error', () => {
    ws.disconnect(true)
  })

  this.on('end', () => {
    ws.disconnect(true)
  })
}
util.inherits(SocketIOJSONStream, Duplex)

SocketIOJSONStream.prototype.setRoom = function(room) {
  console.log('set room', room)
  this.room = room
}

SocketIOJSONStream.prototype._read = function() {}
SocketIOJSONStream.prototype._write = function(msg, encoding, next) {
  this.ws.emit('sharedb', JSON.stringify(msg))
  // if (msg && msg.a === "init") {
  //   this.ws.emit("sharedb", JSON.stringify(msg));
  // } else {
  //   this.ws.broadcast.to(this.room).emit("sharedb", JSON.stringify(msg));
  // }
  next()
}

export default SocketIOJSONStream
