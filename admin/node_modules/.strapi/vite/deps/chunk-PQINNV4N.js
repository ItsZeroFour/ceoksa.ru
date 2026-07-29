// node_modules/@strapi/admin/dist/admin/admin/src/utils/strings.mjs
var capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
function getByteSize(value) {
  return new TextEncoder().encode(value).length;
}

export {
  capitalise,
  getByteSize
};
//# sourceMappingURL=chunk-PQINNV4N.js.map
