import yaml from "js-yaml";
import deepmerge from "deepmerge";

const tags = ["!add", "!remove"];

const symbolToTag = {};
tags.forEach(tag => symbolToTag[Symbol.for(tag)] = tag);

const tagDef = {
  resolve: () => true,
  instanceOf: Object,
  represent: (data) => data
};

const types = tags.map(tag => {
  const construct = data => { 
    data[Symbol.for(tag)] = true; 
    return data; 
  };

  return [
    new yaml.Type(tag, { ...tagDef, construct, kind: "mapping" }),
    new yaml.Type(tag, { ...tagDef, construct, kind: "sequence" })
  ];
}).flat();

export const schema = yaml.JSON_SCHEMA.extend(types);

export const customMerge = () => (a, b) => {
  if(Array.isArray(a) && Array.isArray(b)) {
    if(b[Symbol.for("!add")]) {
      return a.concat(b);
    } else if(b[Symbol.for("!remove")]) {
      return a.filter(x => !b.includes(x));
    } else {
      return b;
    }
  } else if (typeof a === "object" && typeof b === "object") {
    if(b[Symbol.for("!add")]) {
      return deepmerge(a, b, { customMerge });
    } else if(b[Symbol.for("!remove")]) {
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

export const mergeSection = (ruleset, name, sectionName, entry) => Object.assign({}, deepmerge(ruleset[name][sectionName], entry, { clone: false, customMerge }));
export const mergeList = list => list.reduce((acc, obj) => deepmerge(acc, obj, { clone: false }));


/*
  What is all this crap for?
  OXCE YAML uses YAML tags in order to control array and object merge behavior.
  These are essentially metadata properties that are attached to nodes.
  In memory, we can represent this as Symbols on the affected entity,
  However, Symbols are non-serializable, so they can't be persisted, and can't cross
  message boundaries (if we need to use webworkers).

  In order to persist, we need to convert the tag data into an external data structure.
  Unfortunately, the parser won't give us the path at parse time,
  so we need to re-traverse the tree to find the tags and store them.
*/

function traverse(x, cb, path = []) {
  cb(x, path);
  
  if(!Array.isArray(x) && (typeof x !== "object" || x === null)) {
    return;
  }
  
  if(Array.isArray(x)) {
    x.forEach((item, i) => {
      traverse(item, cb, [...path, i]);
    });
  } else {
    Object.keys(x).forEach(key => {
      traverse(x[key], cb, [...path, key]);
    });
  }
}

export function findTags(result) {
  const tagPaths = tags.reduce((acc, tag) => {
    acc[tag] = [];
    return acc;
  }, {});

  traverse(result, (item, path) => {
    if(!item) return;

    tags.forEach(tag => {
      if(item[Symbol.for(tag)]) {
        tagPaths[symbolToTag[Symbol.for(tag)]].push(path);
      }
    });
  });

  const tagsFound = tags.reduce((acc, tag) => {
    acc += tagPaths[tag].length; 
    return acc;
  }, 0);

  return tagsFound ? tagPaths : null;
}


// TODO: Make this async if we need to shift parsing to workers.
export function parse(text) {
    const result = yaml.load(text, { json: true, schema });
    return dehydrate(result);
}

export function hydrate([tree, tagPaths]) {
  if(!tagPaths) return tree;
  Object.entries(tagPaths).forEach(([tag, paths]) => {
    paths.forEach(path => {
      let node = tree;
      for(let pathKey of path) { //walk tree to target object
        node = node[pathKey];
      }
      node[Symbol.for(tag)] = true;
    })
  });
  return tree;
}

export function dehydrate(result) {
  const tagPaths = findTags(result);
  return [result, tagPaths];
}

const defaultExports = { dehydrate, hydrate, findTags, mergeSection, mergeList, parse };
export default defaultExports;