import type { ArrayItemSchema, ComplexArrayItems, SimpleArrayItem } from '..';
import type { ValueSegment } from '../../editor';
import { ValueSegmentType } from '../../editor';
import type { CastHandler } from '../../editor/base';
import { convertStringToSegments } from '../../editor/base/utils/editorToSegement';
import { getChildrenNodes } from '../../editor/base/utils/helper';
import { convertComplexItemsToArray, validationAndSerializeComplexArray, validationAndSerializeSimpleArray } from './util';
import { guid } from '@microsoft/utils-logic-apps';
import type { LexicalEditor } from 'lexical';
import { $getRoot } from 'lexical';

const emptyArrayValue = [{ id: guid(), type: ValueSegmentType.LITERAL, value: '[]' }];

export const serializeSimpleArray = (
  editor: LexicalEditor,
  setItems: (items: SimpleArrayItem[]) => void,
  setIsValid: (b: boolean) => void
) => {
  editor.getEditorState().read(() => {
    const nodeMap = new Map<string, ValueSegment>();
    const editorString = getChildrenNodes($getRoot(), nodeMap);
    validationAndSerializeSimpleArray(editorString, nodeMap, setItems, setIsValid);
  });
};

export const serializeComplexArray = (
  editor: LexicalEditor,
  itemSchema: ArrayItemSchema,
  setItems: (items: ComplexArrayItems[]) => void,
  setIsValid: (b: boolean) => void
) => {
  editor.getEditorState().read(() => {
    const nodeMap = new Map<string, ValueSegment>();
    const editorString = getChildrenNodes($getRoot(), nodeMap);
    validationAndSerializeComplexArray(editorString, nodeMap, itemSchema, setItems, setIsValid, undefined);
  });
};

export const parseSimpleItems = (
  items: SimpleArrayItem[],
  itemSchema: ArrayItemSchema,
  castParameter: CastHandler
): { castedValue: ValueSegment[]; uncastedValue: ValueSegment[] } => {
  if (items.length === 0) {
    return { castedValue: emptyArrayValue, uncastedValue: emptyArrayValue };
  }
  const { type, format } = itemSchema;
  const castedArraySegments: ValueSegment[] = [];
  const uncastedArraySegments: ValueSegment[] = [];
  castedArraySegments.push({ id: guid(), type: ValueSegmentType.LITERAL, value: '[\n  "' });
  uncastedArraySegments.push({ id: guid(), type: ValueSegmentType.LITERAL, value: '[\n  "' });
  items.forEach((item, index) => {
    const { value } = item;
    castedArraySegments.push({ id: guid(), type: ValueSegmentType.LITERAL, value: castParameter(value, type, format) });
    uncastedArraySegments.push(...value);
    castedArraySegments.push({ id: guid(), type: ValueSegmentType.LITERAL, value: index < items.length - 1 ? '",\n  "' : '"\n]' });
    uncastedArraySegments.push({ id: guid(), type: ValueSegmentType.LITERAL, value: index < items.length - 1 ? '",\n  "' : '"\n]' });
  });
  return { uncastedValue: uncastedArraySegments, castedValue: castedArraySegments };
};

export const parseComplexItems = (
  allItems: ComplexArrayItems[],
  itemSchema: ArrayItemSchema,
  castParameter: CastHandler
): { castedValue: ValueSegment[]; uncastedValue: ValueSegment[] } => {
  if (allItems.length === 0) {
    return { castedValue: emptyArrayValue, uncastedValue: emptyArrayValue };
  }
  const castedArrayVal: any = [];
  const uncastedArrayVal: any = [];
  const nodeMap = new Map<string, ValueSegment>();
  allItems.forEach((currItem) => {
    const { items } = currItem;
    castedArrayVal.push(convertComplexItemsToArray(itemSchema, items, nodeMap, /*suppress casting*/ false, castParameter));
    uncastedArrayVal.push(convertComplexItemsToArray(itemSchema, items, nodeMap, /*suppress casting*/ true, castParameter));
  });
  return {
    castedValue: convertStringToSegments(JSON.stringify(castedArrayVal, null, 4), true, nodeMap),
    uncastedValue: convertStringToSegments(JSON.stringify(uncastedArrayVal, null, 4), true, nodeMap),
  };
};
