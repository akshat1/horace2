
SortColumn =
  Title : 'title'
  Year  : 'year'


SortDirection =
  ASC  : 'ascending'
  DESC : 'descending'
  flip : (sDir) -> if sDir is @ASC then @DESC else @ASC




module.exports =
  SortColumn    : SortColumn
  SortDirection : SortDirection