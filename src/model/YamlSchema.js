import yaml from "js-yaml";
import deepmerge from "deepmerge";

const tags = ["!add", "!remove"];

export const symbols = tags.reduce((acc, tag) => {
  acc[tag] = Symbol(tag);
  return acc;
}, {});

const tagDef = {
  resolve: () => true,
  instanceOf: Object,
  represent: (data) => data
};

const types = tags.map(tag => [
  new yaml.Type(tag, {
    ...tagDef,
    construct: (data) => {
      data[symbols[tag]] = true;
      return data;
    },
    kind: "mapping"
  }),
  new yaml.Type(tag, {
    ...tagDef,
    construct: (data) => {
      data[symbols[tag]] = true;
      return data;
    },
    kind: "sequence"
  }),
]).flat();

export const schema = yaml.JSON_SCHEMA.extend(types);

export const customMerge = () => (a, b) => {
  if(Array.isArray(a) && Array.isArray(b)) {
    if(b[symbols["!add"]]) {
      return a.concat(b);
    } else if(b[symbols["!remove"]]) {
      return a.filter(x => !b.includes(x));
    } else {
      return b;
    }
  } else if (typeof a === "object" && typeof b === "object") {
    if(b[symbols["!add"]]) {
      return deepmerge(a, b, { customMerge });
    } else if(b[symbols["!remove"]]) {
      Object.keys(b).forEach(k => {
        delete a[k];
      })
      return a;
    } else {
      return b;
    }
  }
  return b;
}