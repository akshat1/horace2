'use strict';

describe('db.js', function() {
  describe('saveBook', function() {
    it('tests that saveBook acquires a db connection');
    it('tests that saveBook upserts the provided book');
  });


  describe('getBook', function() {
    it('tests that getBook acquires a db connection');
    it('tests that getBook searches the books collection with the provided id');
    it('tests that getBook returns the book returned by the db');
  });


  describe('getBooks', function() {
    it('tests that getBooks acquires a db connection');
  });


  describe('getDistinctBookAttribute', function() {
    it('tests that getDistinctBookAttribute acquires a db connection');
  });
});
