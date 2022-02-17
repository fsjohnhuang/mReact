const createInstance = (node) => {
  let element = null
  if (node.type === 'TEXT_ELEMENT') {
    element = document.createTextNode("")
  }
  else {
    element = document.createElement(node.type)
  }

  // props
  if (node.props) {
    Object.keys(node.props).forEach(name => {
      element[name] = node.props[name]
    })
  }

  return element
}

let currentRoot = null

function diff(nextNode, prevNode) {
  if (!nextNode) {
    return {
      type: prevNode.type,
      dom: prevNode.dom,
      effectTag: 'delete'
    }
  }
  else if (!prevNode) {
    if (nextNode.children) {
      nextNode.children = nextNode.children.map(child => diff(child, null))
    }
    nextNode.effectTag = 'create'

    return nextNode
  }
  else {
    if (nextNode.type === prevNode.type) {
      const childPatches = []
      const l = Math.max(nextNode.children ? nextNode.children.length : 0, prevNode.children ? prevNode.children.length : 0)
      for (let i = 0; i < l; i++) {
        childPatches.push(diff(nextNode.children ? nextNode.children[i] : null, prevNode.children ? prevNode.children[i] : null))
      }
      nextNode.children = childPatches
      nextNode.prevProps = prevNode.props
      nextNode.dom = prevNode.dom
      nextNode.effectTag = 'update'

      return nextNode
    }
    else {
      nextNode.prevDom = prevNode.dom
      nextNode.effectTag = 'replace'
    }
  }
}

function patch(container, node) {
  if (node.effectTag === 'delete') {
    node.dom.parentElement.removeChild(node.dom)
  }
  else {
    if (node.effectTag === 'create') {
      container.appendChild(node.dom = createInstance(node))
    }
    else if (node.effectTag === 'replace') {
      node.dom = createInstance(node)
      node.prevDom.parentElement.replaceChild(node.prevDom, node.dom)

    }
    else if (node.effectTag === 'update') {
      if (node.props) {
        Object.keys(node.props).forEach(name => {
          if (node.dom[name] !== node.props[name]) {
            node.dom[name] = node.props[name]
          }
        })
      }
      if (node.prevProps) {
        Object.keys(node.prevProps).forEach(name => {
          if (!(name in node.props)) {
            node.dom[name] = null
          }
        })
      }
    }

    if (node.children) {
      node.children.forEach(child => patch(node.dom, child))
    }
  }
}

function render(node, container) {
  const patches = diff(node, currentRoot)
  patch(container, patches)

  currentRoot = node
}


const createElement = (type, props, ...children) => {
  return {
    type,
    props,
    children: children.filter(child => child != undefined).flatMap(x => x).map(child => typeof child === 'object' 
      ? child 
      : { type: 'TEXT_ELEMENT', props: { nodeValue: child }})
  }
}

let message = 1
window.setMessage = (val) => {
  message = val
  render(App(), document.querySelector('body'))
}

const App = ()=>(
  <div>
    <div>{message}</div>
    {Array.from(Array(message).keys()).map(i => (
      <div key={i}>{i}</div>
    ))}
  </div>
)

render(App(), document.querySelector('body'))