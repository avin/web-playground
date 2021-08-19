// @process

import fragment from '../shaders/fragment.code';
import postFragment from '../shaders/postFragment.code';
import vertex from '../shaders/vertex.code';

function stringToBuffer(str) {
  const arr = str.split(',');
  const view = new Uint32Array(arr);
  return view;
}

window.SHADERS = {
  fragment: stringToBuffer(fragment),
  postFragment: stringToBuffer(postFragment),
  vertex: stringToBuffer(vertex),
};
