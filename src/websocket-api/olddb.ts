const pg = require('pg')
const { DB } = require('sharedb')

// Postgres-backed ShareDB database

function PostgresDB(options) {
  // if (!(this instanceof PostgresDB)) return new PostgresDB(options);
  DB.call(this, options)

  this.closed = false

  this.pool = new pg.Pool(options)
}

PostgresDB.prototype = Object.create(DB.prototype)

PostgresDB.prototype.close = function(callback) {
  this.closed = true
  this.pool.end()

  if (callback) callback()
}

function rollback(client, done) {
  client.query('ROLLBACK', function(err) {
    return done(err)
  })
}

// Persists an op and snapshot if it is for the next version. Calls back with
// callback(err, succeeded)
PostgresDB.prototype.commit = function(
  collection,
  id,
  op,
  snapshot,
  options,
  callback
) {
  const { uId: actorId } = op.m
  /*
   * op: CreateOp {
   *   src: '24545654654646',
   *   seq: 1,
   *   v: 0,
   *   create: { type: 'http://sharejs.org/types/JSONv0', data: { ... } },
   *   m: { ts: 12333456456 } }
   * }
   * snapshot: PostgresSnapshot
   */
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client)
      callback(err)
      return
    }
    function commit() {
      client.query('COMMIT', function(err) {
        done(err)
        if (err) {
          callback(err)
        } else {
          callback(null, true)
        }
      })
    }
    client.query(
      // "SELECT max(version) AS max_version FROM operations WHERE collection = $1 AND doc_id = $2",
      'SELECT max(version) AS max_version FROM operations WHERE flow_id = $1',
      // [collection, id],
      [id],
      function(err, res) {
        var max_version = res.rows[0].max_version
        if (max_version == null) max_version = 0
        if (snapshot.v !== max_version + 1) {
          return callback(null, false)
        }

        client.query('BEGIN', function(err) {
          client.query(
            // "INSERT INTO operations (collection, doc_id, version, operation) VALUES ($1, $2, $3, $4)",
            'INSERT INTO operations (flow_id, version, data, actor_id) VALUES ($1, $2, $3, $4)',
            [id, snapshot.v, op, actorId],
            function(err, res) {
              if (err) {
                // TODO: if err is "constraint violation", callback(null, false) instead
                rollback(client, done)
                callback(err)
                return
              }
              if (snapshot.v === 1) {
                client.query(
                  // "INSERT INTO snapshots (collection, doc_id, doc_type, version, data) VALUES ($1, $2, $3, $4, $5)",
                  // "INSERT INTO flows (doc_id, doc_type, version, data) VALUES ($1, $2, $3, $4)",
                  'UPDATE flows SET version = $1, data = $2, updated_at = $4 WHERE id = $3',
                  [snapshot.v, snapshot.data, id, new Date().toISOString()],
                  function(err, res) {
                    // TODO:
                    // if the insert was successful and did insert, callback(null, true)
                    // if the insert was successful and did not insert, callback(null, false)
                    // if there was an error, rollback and callback(error)
                    if (err) {
                      rollback(client, done)
                      callback(err)
                      return
                    }
                    commit()
                  }
                )
              } else {
                client.query(
                  // "UPDATE snapshots SET doc_type = $3, version = $4, data = $5 WHERE collection = $1 AND doc_id = $2 AND version = ($4 - 1)",
                  'UPDATE flows SET version = $2, data = $3, updated_at = $4 WHERE id = $1 AND version = ($2 - 1)',
                  [id, snapshot.v, snapshot.data, new Date().toISOString()],
                  function(err, res) {
                    // TODO:
                    // if any rows were updated, success
                    // if 0 rows were updated, rollback and not success
                    // if error, rollback and not success
                    if (err) {
                      rollback(client, done)
                      callback(err)
                      return
                    }
                    commit()
                  }
                )
              }
            }
          )
        })
      }
    )
  })
}

// Get the named document from the database. The callback is called with (err,
// snapshot). A snapshot with a version of zero is returned if the docuemnt
// has never been created in the database.
PostgresDB.prototype.getSnapshot = function(
  collection,
  id,
  fields,
  options,
  callback
) {
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client)
      callback(err)
      return
    }
    client.query(
      // "SELECT version, data, doc_type FROM snapshots WHERE collection = $1 AND doc_id = $2 LIMIT 1",
      'SELECT version, data FROM flows WHERE id = $1 LIMIT 1',
      [id],
      function(err, res) {
        done()
        if (err) {
          callback(err)
          return
        }
        if (res.rows.length && res.rows[0].version) {
          var row = res.rows[0]
          var snapshot = new PostgresSnapshot(
            id,
            row.version,
            'http://sharejs.org/types/JSONv0',
            row.data,
            undefined // TODO: metadata
          )
          callback(null, snapshot)
        } else {
          var snapshot = new PostgresSnapshot(id, 0, null, undefined, undefined)
          callback(null, snapshot)
        }
      }
    )
  })
}

// Get operations between [from, to) noninclusively. (Ie, the range should
// contain start but not end).
//
// If end is null, this function should return all operations from start onwards.
//
// The operations that getOps returns don't need to have a version: field.
// The version will be inferred from the parameters if it is missing.
//
// Callback should be called as callback(error, [list of ops]);
PostgresDB.prototype.getOps = function(
  collection,
  id,
  from,
  to,
  options,
  callback
) {
  this.pool.connect(function(err, client, done) {
    if (err) {
      done(client)
      callback(err)
      return
    }
    client.query(
      // "SELECT version, operation FROM operations WHERE collection = $1 AND doc_id = $2 AND version >= $3 AND version < $4",
      'SELECT version, data FROM operations WHERE flow_id = $1 AND version >= $2 AND version < $3',
      [id, from, to],
      function(err, res) {
        done()
        if (err) {
          callback(err)
          return
        }
        callback(
          null,
          res.rows.map(function(row) {
            return row.data
          })
        )
      }
    )
  })
}

function PostgresSnapshot(id, version, type, data, meta) {
  this.id = id
  this.v = version
  this.type = type
  this.data = data
  this.m = meta
}

// -----------------------------------------------------------------------------

// module.exports = PostgresDB;
export default PostgresDB
