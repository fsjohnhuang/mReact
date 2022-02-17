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
}

export function render(node, container) {
  const element = createInstance(node)
  container.appendChild(element)
  if (node.children) {
    node.children.forEach(child => {
      render(child, element)
    })
  }
}