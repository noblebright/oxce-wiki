import yaml from "js-yaml";

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