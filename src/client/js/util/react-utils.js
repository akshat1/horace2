const findElement = (children, searchTargetType) =>
  children.find((c) => c.type === searchTargetType);


module.exports = {
  findElement
};
