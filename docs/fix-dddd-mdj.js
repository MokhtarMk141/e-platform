const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const sourcePath = process.argv[2];
const outputPath = process.argv[3];

if (!sourcePath || !outputPath) {
  console.error('Usage: node docs/fix-dddd-mdj.js <source.mdj> <output.mdj>');
  process.exit(1);
}

const IDS = {
  diagram: 'AAAAAAGd2lcuNAdQ4is=',
  visitorActorModel: 'AAAAAAGd2l4uywdTUt4=',
  visitorActorView: 'AAAAAAGd2l4uzAdVYlo=',
  authModel: 'AAAAAAGd26L4c3KgH8w=',
  duplicateAuthModel: 'AAAAAAGd26TL0hEBZ1g=',
  authView: 'AAAAAAGd26L4c3KiFr0=',
  duplicateAuthView: 'AAAAAAGd26TL0xEDQAM=',
  hiddenAnalyticsInclude: 'AAAAAAGd26N2r8X6e0c=',
  strayUseCase: 'AAAAAAGd25IQ1X6Ml5g=',
  associationTemplateModel: 'AAAAAAGd25gK07DkOHQ=',
  associationTemplateView: 'AAAAAAGd25gK07DoHbY=',
};

const RENAME_MAP = new Map([
  ['visitor', 'Visitor'],
  ['customer', 'Customer'],
  ['Manage Customers', 'View Customers'],
  ['Reset Password', 'Password Recovery'],
  ['Chat with Al Assistant', 'Chat with AI Assistant'],
  ['Al Service', 'AI Service'],
  ['Search - Recommend Products', 'Search and Recommend Products'],
  ['authentification', 'Authenticate'],
]);

const LAYOUT_KEYS = new Set([
  'left',
  'top',
  'width',
  'height',
  'alpha',
  'distance',
  'font',
  'parentStyle',
  'containerChangeable',
  'showVisibility',
  'lineStyle',
  'suppressAttributes',
  'suppressOperations',
  'visible',
]);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function walk(node, visitor) {
  if (Array.isArray(node)) {
    for (const item of node) {
      walk(item, visitor);
    }
    return;
  }
  if (!node || typeof node !== 'object') {
    return;
  }
  visitor(node);
  for (const value of Object.values(node)) {
    walk(value, visitor);
  }
}

function buildIndex(root) {
  const index = new Map();
  walk(root, (node) => {
    if (node._id) {
      index.set(node._id, node);
    }
  });
  return index;
}

function removeObjects(root, predicate) {
  if (Array.isArray(root)) {
    for (let i = root.length - 1; i >= 0; i -= 1) {
      const item = root[i];
      if (item && typeof item === 'object' && predicate(item)) {
        root.splice(i, 1);
        continue;
      }
      removeObjects(item, predicate);
    }
    return;
  }
  if (!root || typeof root !== 'object') {
    return;
  }
  for (const value of Object.values(root)) {
    removeObjects(value, predicate);
  }
}

function replaceRefs(root, fromId, toId) {
  walk(root, (node) => {
    if (typeof node.$ref === 'string' && node.$ref === fromId) {
      node.$ref = toId;
    }
  });
}

function renameStrings(root) {
  walk(root, (node) => {
    if (typeof node.name === 'string' && RENAME_MAP.has(node.name)) {
      node.name = RENAME_MAP.get(node.name);
    }
    if (typeof node.text === 'string' && RENAME_MAP.has(node.text)) {
      node.text = RENAME_MAP.get(node.text);
    }
  });
}

function copyLayoutTree(sourceNode, targetNode) {
  if (Array.isArray(sourceNode) && Array.isArray(targetNode)) {
    const count = Math.min(sourceNode.length, targetNode.length);
    for (let i = 0; i < count; i += 1) {
      copyLayoutTree(sourceNode[i], targetNode[i]);
    }
    return;
  }
  if (!sourceNode || !targetNode || typeof sourceNode !== 'object' || typeof targetNode !== 'object') {
    return;
  }
  for (const [key, value] of Object.entries(sourceNode)) {
    if (LAYOUT_KEYS.has(key)) {
      targetNode[key] = value;
    }
  }
  for (const [key, value] of Object.entries(sourceNode)) {
    if (key === '_id' || key === '_type' || key === '_parent' || key === 'model' || key === 'text') {
      continue;
    }
    if (Array.isArray(value) && Array.isArray(targetNode[key])) {
      copyLayoutTree(value, targetNode[key]);
    } else if (value && typeof value === 'object' && targetNode[key] && typeof targetNode[key] === 'object') {
      copyLayoutTree(value, targetNode[key]);
    }
  }
}

function box(view) {
  return {
    left: Number(view.left) || 0,
    top: Number(view.top) || 0,
    width: Number(view.width) || 0,
    height: Number(view.height) || 0,
    right: (Number(view.left) || 0) + (Number(view.width) || 0),
    bottom: (Number(view.top) || 0) + (Number(view.height) || 0),
  };
}

function centerCoords(rect) {
  return {
    x: Math.round(rect.left + rect.width / 2),
    y: Math.round(rect.top + rect.height / 2),
  };
}

function buildStraightEdgePoints(tailView, headView) {
  const tail = box(tailView);
  const head = box(headView);
  const tailCenter = centerCoords(tail);
  const headCenter = centerCoords(head);

  const horizontalGap = Math.max(head.left - tail.right, tail.left - head.right, 0);
  const verticalGap = Math.max(head.top - tail.bottom, tail.top - head.bottom, 0);

  let start;
  let end;

  if (horizontalGap >= verticalGap && horizontalGap > 0) {
    if (tail.right <= head.left) {
      start = [tail.right, tailCenter.y];
      end = [head.left, headCenter.y];
    } else {
      start = [tail.left, tailCenter.y];
      end = [head.right, headCenter.y];
    }
  } else if (verticalGap > 0) {
    if (tail.bottom <= head.top) {
      start = [tailCenter.x, tail.bottom];
      end = [headCenter.x, head.top];
    } else {
      start = [tailCenter.x, tail.top];
      end = [headCenter.x, head.bottom];
    }
  } else if (tailCenter.x <= headCenter.x) {
    start = [tail.right, tailCenter.y];
    end = [head.left, headCenter.y];
  } else {
    start = [tail.left, tailCenter.y];
    end = [head.right, headCenter.y];
  }

  return `${start[0]}:${start[1]};${end[0]}:${end[1]}`;
}

function generateId(usedIds) {
  let id = '';
  do {
    id = crypto.randomBytes(12).toString('base64');
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

function assignNewIds(node, usedIds, replacements = new Map()) {
  if (Array.isArray(node)) {
    for (const item of node) {
      assignNewIds(item, usedIds, replacements);
    }
    return replacements;
  }
  if (!node || typeof node !== 'object') {
    return replacements;
  }
  if (node._id) {
    const newId = generateId(usedIds);
    replacements.set(node._id, newId);
    node._id = newId;
  }
  for (const value of Object.values(node)) {
    assignNewIds(value, usedIds, replacements);
  }
  return replacements;
}

function replaceRefValues(root, replacements) {
  walk(root, (node) => {
    if (typeof node.$ref === 'string' && replacements.has(node.$ref)) {
      node.$ref = replacements.get(node.$ref);
    }
  });
}

function addVisitorAuthenticateAssociation(data) {
  const index = buildIndex(data);
  const visitorActor = index.get(IDS.visitorActorModel);
  const visitorView = index.get(IDS.visitorActorView);
  const authModel = index.get(IDS.authModel);
  const authView = index.get(IDS.authView);
  const diagram = index.get(IDS.diagram);

  if (!visitorActor || !visitorView || !authModel || !authView || !diagram) {
    throw new Error('Missing diagram elements needed to add Visitor -> Authenticate association.');
  }

  const existingAssociation = (visitorActor.ownedElements || []).find((element) => {
    return element &&
      element._type === 'UMLAssociation' &&
      element.end1 &&
      element.end2 &&
      element.end1.reference &&
      element.end2.reference &&
      element.end1.reference.$ref === IDS.visitorActorModel &&
      element.end2.reference.$ref === IDS.authModel;
  });

  if (!existingAssociation) {
    const usedIds = new Set(index.keys());
    const associationId = generateId(usedIds);
    const end1Id = generateId(usedIds);
    const end2Id = generateId(usedIds);

    const association = {
      _type: 'UMLAssociation',
      _id: associationId,
      _parent: { $ref: IDS.visitorActorModel },
      end1: {
        _type: 'UMLAssociationEnd',
        _id: end1Id,
        _parent: { $ref: associationId },
        reference: { $ref: IDS.visitorActorModel },
      },
      end2: {
        _type: 'UMLAssociationEnd',
        _id: end2Id,
        _parent: { $ref: associationId },
        reference: { $ref: IDS.authModel },
        navigable: 'navigable',
      },
    };

    visitorActor.ownedElements = visitorActor.ownedElements || [];
    visitorActor.ownedElements.push(association);

    const refreshedIndex = buildIndex(data);
    const templateView = deepClone(refreshedIndex.get(IDS.associationTemplateView));
    const templateAssoc = refreshedIndex.get(IDS.associationTemplateModel);

    if (!templateView || !templateAssoc) {
      throw new Error('Missing association template for Visitor -> Authenticate view.');
    }

    const viewIdReplacements = assignNewIds(templateView, usedIds);
    const refReplacements = new Map(viewIdReplacements);
    refReplacements.set(templateAssoc._id, associationId);
    refReplacements.set(templateAssoc.end1._id, end1Id);
    refReplacements.set(templateAssoc.end2._id, end2Id);

    replaceRefValues(templateView, refReplacements);
    templateView._parent = { $ref: IDS.diagram };
    templateView.model = { $ref: associationId };
    templateView.head = { $ref: IDS.authView };
    templateView.tail = { $ref: IDS.visitorActorView };
    templateView.points = buildStraightEdgePoints(visitorView, authView);

    diagram.ownedViews.push(templateView);
  }
}

function retargetAuthIncludeViews(data) {
  const index = buildIndex(data);
  const authView = index.get(IDS.authView);
  if (!authView) {
    throw new Error('Canonical auth view is missing.');
  }

  walk(data, (node) => {
    if (node._type !== 'UMLIncludeView' || !node.model || !node.model.$ref) {
      return;
    }
    const includeModel = index.get(node.model.$ref);
    if (!includeModel || !includeModel.target || includeModel.target.$ref !== IDS.authModel) {
      return;
    }
    const tailView = index.get(node.tail.$ref);
    if (!tailView) {
      return;
    }
    node.head = { $ref: IDS.authView };
    node.points = buildStraightEdgePoints(tailView, authView);
  });
}

function main() {
  const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  let index = buildIndex(data);

  const authView = index.get(IDS.authView);
  const duplicateAuthView = index.get(IDS.duplicateAuthView);
  if (!authView || !duplicateAuthView) {
    throw new Error('Expected auth views were not found.');
  }

  copyLayoutTree(duplicateAuthView, authView);
  replaceRefs(data, IDS.duplicateAuthModel, IDS.authModel);
  replaceRefs(data, IDS.duplicateAuthView, IDS.authView);
  renameStrings(data);

  removeObjects(data, (node) => {
    return node._id === IDS.hiddenAnalyticsInclude ||
      node._id === IDS.duplicateAuthView ||
      node._id === IDS.duplicateAuthModel ||
      node._id === IDS.strayUseCase;
  });

  addVisitorAuthenticateAssociation(data);
  retargetAuthIncludeViews(data);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(data, null, '\t')}\n`, 'utf8');
}

main();
