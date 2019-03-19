import { DB } from 'sharedb'
import { getManager } from 'typeorm'
import Flow from '../db/entities/Flow'
import Operation from '../db/entities/Operation'

class PDB extends DB {
  public closed = false

  constructor(options) {
    super(options)
  }

  close(callback) {
    console.log('close')
    this.closed = true
    if (callback) callback()
  }

  async getSnapshot(collection, id, fields, options, callback) {
    console.log('getSnapshot')

    const flowRespository = getManager().getRepository(Flow)

    try {
      const flow = await flowRespository.findOneOrFail(id)
      console.log({ flow })

      let snapshot

      if (flow.version) {
        snapshot = new Snapshot({
          id,
          version: flow.version,
          type: 'http://sharejs.org/types/JSONv0',
          data: flow.data,
          meta: undefined,
        })
      } else {
        snapshot = new Snapshot({
          id,
          version: 0,
          type: null,
          data: undefined,
          meta: undefined,
        })
      }
      callback(null, snapshot)
    } catch (err) {
      callback(err)
    }
  }

  async getOps(collection, id, from, to, options, callback) {
    console.log('getOps')
    const operationsRespository = getManager().getRepository(Operation)

    try {
      const operations = await operationsRespository
        .createQueryBuilder('operations')
        .where(
          'operations.flow_id = :id AND operations.version >= :from AND operations.version < :to',
          {
            id,
            from,
            to,
          }
        )
        .getMany()
      callback(null, operations)
    } catch (err) {
      callback(err)
    }
  }

  commit(collection, id, op, snapshot, options, callback) {
    console.log('commit')
  }
}

function Snapshot({ id, version, type, data, meta }) {
  this.id = id
  this.v = version
  this.type = type
  this.data = data
  this.m = meta
}

export default PDB
