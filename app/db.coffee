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
      {_id: book._id},
      book,
      {upsert: true},
      handleUpsert
      )
  p


# TODO: opts -> query
getBooks = (opts = {}) ->
  console.log '\n\n\nGET BOOKS (%o)\n\n', opts
  console.log '\n\n\n\n'
  p = new Promise (resolve, reject) ->
    logger.info 'getBooks(%o)', opts
    sortOpts = {}
    sortOpts[opts.sortcolumnName or $Sorting.SortColumn.Title] = if opts.sortDirection is $Sorting.SortDirection.ASC then 1 else -1
    console.log "\n\n", sortOpts, "\n\n"
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




# ---------------- ---------------- ----------------

module.exports =
  saveBook : saveBook
  getBooks : getBooks
