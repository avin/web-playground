// @process

import fragment from 'raw:../shaders/fragment.code';
import postFragment from 'raw:../shaders/postFragment.code';
import vertex from 'raw:../shaders/vertex.code';

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
