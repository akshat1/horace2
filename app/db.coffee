$Tingo   = require 'tingodb'
$Winston = require 'winston'
_        = require 'lodash'
$FSExtra = require 'fs-extra'

$Config = require './config.coffee'


Collection =
  Books: 'horace-books'


logLevel = $Config 'horace.db.logLevel'
logger   = new $Winston.Logger
  transports: [
    new $Winston.transports.Console({
      level: logLevel
      }),
    new $Winston.transports.File({
      filename: 'horace-db.log'
      })
  ]


dbLocation = $Config 'horace.db.location'
throw new Error 'dbLocation not defined' unless dbLocation
logger.info "Ensure #{dbLocation}"
$FSExtra.ensureDir dbLocation

logger.info 'Create db instance'
Engine = $Tingo()
database = new Engine.Db dbLocation, {}
collectionBooks = database.collection Collection.Books


saveBook = (book) ->
  logger.info 'saveBook(%o)', book.id
  p = new Promise (resolve, reject) ->
    handleUpsert = (err) -> 
      if err
        logger.error 'Upsert error %o', err
        reject err
      else
        logger.info 'Saved book'
        resolve()

    logger.debug 'run upsert'
    collectionBooks.update(
      {_id: book._id}, 
      book, 
      {upsert: true}, 
      handleUpsert
      )
  p


# TODO: opts -> query
getBooks = (opts) ->
  p = new Promise (resolve, reject) ->
    logger.info 'getBooks(%o)', opts
    collectionBooks.find().toArray (curErr, books) ->
      if curErr
        logger.error 'Error converting to array', curErr
        reject curErr
      else
        logger.info 'Resolve promise with books %o', books
        resolve books
  p




# ---------------- ---------------- ----------------

module.exports =
  saveBook : saveBook
  getBooks : getBooks
  