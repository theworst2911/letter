// adapted from this: https://github.com/Swizec/useDimensions
import { useState, useCallback, useLayoutEffect } from "react"

function getDimensionObject(node) {
  const rect = node.getBoundingClientRect()

  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    x: "x" in rect ? rect.x : rect.left,
    y: "y" in rect ? rect.y : rect.top,
    right: rect.right,
    bottom: rect.bottom,
  }
}


function useDimensions() {
  const [dimensions, setDimensions] = useState({})
  const [node, setNode] = useState(null)

  const ref = useCallback(node => {
    setNode(node)
  }, [])

  useLayoutEffect(() => {
    if (node) {
      const measure = () => {
        window.requestAnimationFrame(() => {
          setDimensions(getDimensionObject(node))
        })
      }
      
      measure()

      window.addEventListener("resize", measure)

      return () => {
        window.removeEventListener("resize", measure)
      }

    }

    
  }, [node])

  return [ref, dimensions, node]
}

export default useDimensions
