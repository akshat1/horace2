###*
# @module db
###

$Tingo   = require 'tingodb'
$Winston = require 'winston'
_        = require 'lodash'
$FSExtra = require 'fs-extra'

$Config = require './config.coffee'
$Sorting = require './sorting.coffee'


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
        logger.info "Saved book #{book.id}"
        resolve()

    logger.debug 'run upsert'
    collectionBooks.update(
      {id: book.id},
      book,
      {upsert: true},
      handleUpsert
      )
  p


# TODO: opts -> query
getBooks = (opts = {}) ->
  p = new Promise (resolve, reject) ->
    logger.info 'getBooks(%o)', opts
    sortOpts = {}
    sortOpts[opts.sortcolumnName or $Sorting.SortColumn.Title] = if opts.sortDirection is $Sorting.SortDirection.ASC then 1 else -1
    logger.debug 'sortOpts: ', sortOpts
    cur = collectionBooks.find().sort sortOpts
    cur.toArray (curErr, books) ->
      if curErr
        logger.error 'Error converting to array', curErr
        reject curErr
      else
        from       = parseInt(opts.from) or 0
        to         = from + parseInt opts.numItems
        totalBooks = books.length
        unless isNaN to
          books = books[from ... to]
        #logger.info 'Resolve promise with books %o', books
        logger.debug "Return #{books.length} books", books
        resolve
          from       : from
          totalItems : totalBooks
          books      : books
  p


###*
 * @param {number} id of the book being requested
 * @return {Promise}
 * @resolves {Book}
 * @rejects {Error}
###
getBook = (id) ->
  p = new Promise (resolve, reject) ->
    try
      cur = collectionBooks.find
        id: id
      cur.toArray (curErr, books) ->
        if curErr
          reject curErr
        else
          logger.info '(from db) resolve'
          resolve books[0]

    catch err
      logger.error "Error occurred while trying to fetch id: #{id}\n", err
      reject err
  p




# ---------------- ---------------- ----------------

module.exports =
  saveBook : saveBook
  getBooks : getBooks
  getBook  : getBook
