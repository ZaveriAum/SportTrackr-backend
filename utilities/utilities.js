const toCamelCase = (obj) => {
    const result = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
      result[camelKey] = obj[key];
    }
    return result;
  };




  module.exports = {
    toCamelCase,

}
