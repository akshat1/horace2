$Chai  = require 'chai'
$Utils = require '../app/utils.coffee'


should = $Chai.should()
expect = $Chai.expect()


describe 'utils', () ->
  describe 'utils.getHash', () ->
    it 'tests that getHash returns the same value when called with the same arguments (10000 times)', () ->
      inp = 'ruby sass is slow'
      referenceVal = $Utils.getHash inp
      for x in [0 ... 10000]
        testVal = $Utils.getHash inp
        testVal.should.equal referenceVal


    it 'tests that getHash(undefined) throws an exception with the correct message', () ->
      try
        $Utils.getHash()
      catch err
        err.message.should.equal 'Missing argument to generate hash from'

      try
        $Utils.getHash('')
      catch err
        err.message.should.equal 'Missing argument to generate hash from'


    it 'tests that getHash does not return the same value when called with the different arguments (10000 times)', () ->
      inpStub = 'ruby sass is slow'
      lastVal  = null
      lastInp  = null
      for x in [0 ... 10000]
        inp = "inpStub_#{Date.now()}_#{Math.random()}"
        currentVal = $Utils.getHash inp
        currentVal.should.not.equal lastVal, "failed for #{lastInp} & #{inp}"
        lastVal = currentVal
        lastInp = inp




  describe 'utils.conditionalRace', () ->
    it 'tests that conditionalRace returns for the first promise to resolve with a value that satisfies the condition', () ->
      p0 = new Promise (resolve, reject) ->
        resolve -5

      p1 = new Promise (resolve, reject) ->
        resolve 10

      p2 = new Promise (resolve, reject) ->
        resolve 20

      condition = (x) -> x is 10

      $Utils.conditionalRace [p0, p1, p2], condition
        .then (y) ->
          y.should.equal 10

        .catch (err) -> throw err


    it 'tests that conditionalRace uses the identity function as the default value for the condition function', () ->
      p0 = new Promise (resolve, reject) ->
        resolve 0

      p1 = new Promise (resolve, reject) ->
        resolve 0

      p2 = new Promise (resolve, reject) ->
        resolve 20

      condition = (x) -> x is 10

      $Utils.conditionalRace [p0, p1, p2]
        .then (y) ->
          y.should.equal 20

        .catch (err) -> throw err


    it 'tests that conditionalRace rejects when no promise satisfies the condition', (done) ->
      p0 = new Promise (resolve, reject) ->
        resolve 0

      p1 = new Promise (resolve, reject) ->
        resolve 10

      p2 = new Promise (resolve, reject) ->
        resolve 20

      condition = (x) -> x is 30

      $Utils.conditionalRace [p0, p1, p2], condition
        .then (y) -> 
          done()

        .catch (err) -> 
          err.message.should.equal 'No valid values'
          done()

