// @flow
/**
 * This file is shared between server and client.
 * ⚠️ DON'T PUT ANY NODE.JS OR BROWSER-SPECIFIC CODE IN HERE ⚠️
 *
 * Note: This uses Flow comment syntax so this whole file is actually valid JS without any transpilation
 * The reason I did that is because create-react-app doesn't transpile files outside the source folder,
 * so it chokes on the Flow syntax.
 * More info: https://flow.org/en/docs/types/comments/
 */
// $FlowIssue
const EditorState = require('draft-js/lib/EditorState');
// $FlowIssue
const ContentState = require('draft-js/lib/ContentState');
// $FlowIssue
const convertFromRaw = require('draft-js/lib/convertFromRawToDraftState');
// $FlowIssue
const convertToRaw = require('draft-js/lib/convertFromDraftStateToRaw');

const toPlainText = function toPlainText(
  editorState, /*: typeof EditorState */
) /*: string */ {
  return editorState.getCurrentContent().getPlainText();
};

// This is necessary for SSR, if you create an empty editor on the server and on the client they have to
// have matching keys, so just doing fromPlainText('') breaks checksum matching because the key
// of the block is randomly generated twice and thusly does't match
const emptyContentState = convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: '',
      key: 'foo',
      type: 'unstyled',
      entityRanges: [],
    },
  ],
});

const fromPlainText = function fromPlainText(
  text, /*: string */
) /*: typeof EditorState */ {
  if (!text || text === '') return EditorState.createWithContent(emptyContentState);
  return EditorState.createWithContent(ContentState.createFromText(text));
};

const toJSON = function toJSON(
  editorState, /*: typeof EditorState */
) /*: Object */ {
  return convertToRaw(editorState.getCurrentContent());
};

const toState = function toState(json /*: Object */) /*: typeof EditorState */ {
  return EditorState.createWithContent(convertFromRaw(json));
};

const isAndroid = function isAndroid() /*: bool */ {
  return navigator.userAgent.toLowerCase().indexOf('android') > -1;
};

module.exports = {
  toJSON,
  toState,
  toPlainText,
  fromPlainText,
  emptyContentState,
  isAndroid,
};
