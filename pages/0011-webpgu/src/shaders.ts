import fragment from './shaders/fragment.code?raw';
import postFragment from './shaders/postFragment.code?raw';
import vertex from './shaders/vertex.code?raw';

function stringToBuffer(str: string) {
  const arr = str.split(',');
  const view = new Uint32Array(arr.map((s) => parseInt(s.trim(), 10)));
  return view;
}

(window as any).SHADERS = {
  fragment: stringToBuffer(fragment),
  postFragment: stringToBuffer(postFragment),
  vertex: stringToBuffer(vertex),
};
