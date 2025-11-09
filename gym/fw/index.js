const DOM_TYPES = {
  ELEMENT: 'element',
  TEXT: 'text',
  FRAGMENT: 'fragment',
};

function render(vdom, parentEl) {
  if (typeof vdom === 'string') {
    vdom = {
      type: DOM_TYPES.TEXT,
      children: [vdom],
    };
  }

  switch (vdom.type) {
    case DOM_TYPES.ELEMENT: {
      const element = document.createElement(vdom.tag);
      if (vdom.props) {
        setProps(element, vdom.props);
      }
      if (vdom.children) {
        vdom.children.forEach((child) => render(child, element));
      }

      parentEl.appendChild(element);
      return element;
    }
    case DOM_TYPES.TEXT:
      const element = document.createTextNode(vdom.children[0]);
      parentEl.appendChild(element);
      return element;
  }
}

function setProps(element, props) {
  for (const [propName, value] of Object.entries(props)) {
    if (propName === 'className') {
      if (Array.isArray(value)) {
        value.forEach((item) => element.classList.add(item));
      } else if (typeof value === 'string') {
        element.className = value;
      }
      continue;
    }
    if (propName.startsWith('on')) {
      const eventName = propName.replace('on', '').toLowerCase();
      console.log('eventName', eventName);
      element.addEventListener(eventName, value);
      continue;
    }
    element.setAttribute(propName, value);
  }
}

const state = {
  inputVal: 'hello',
};

const makeVdom = () => ({
  type: DOM_TYPES.ELEMENT,
  tag: 'form',
  props: {
    className: 'container',
    onsubmit: (e) => {
      e.preventDefault();
      console.log('submit');
      rerender();
    },
  },
  children: [
    {
      type: DOM_TYPES.ELEMENT,
      tag: 'input',
      props: {
        value: state.inputVal,
        oninput: (e) => {
          const val = e.currentTarget.value;
          console.log('input', val);
          state.inputVal = e.currentTarget.value;
        },
      },
    },
    {
      type: DOM_TYPES.ELEMENT,
      tag: 'button',
      children: ['Submit'],
    },
    {
      type: DOM_TYPES.ELEMENT,
      tag: 'div',
      children: ['VAL: ', state.inputVal],
    },
  ],
});

function rerender() {
  const rootEl = document.querySelector('#app');
  rootEl.innerHTML = '';

  render(makeVdom(), rootEl);
}

rerender();
