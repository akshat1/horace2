
SortColumn =
  Title   : 'title'
  Year    : 'year'
  Adapter : 'adapterId'


SortDirection =
  ASC  : 'ascending'
  DESC : 'descending'
  flip : (sDir) -> if sDir is @ASC then @DESC else @ASC




module.exports =
  SortColumn    : SortColumn
  SortDirection : SortDirection