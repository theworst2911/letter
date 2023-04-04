import React, { useState, useEffect } from 'react'

export default function LazyLoadDatGui({ forceDatGui, handleUpdate, datGuiData, options, ...props }) {

  // Module must be capitalised, because it becomes a React Component
  const [Module, setModule] = useState({})

  useEffect(() => {
    const load = async function() {
      const Module = await import(/* webpackChunkName: 'react-dat-gui' */ '@tim-soft/react-dat-gui')
      setModule(Module)
    }
    load()
  }, [])

  if (!Module.default) return null // not loaded

  return (
    <Module.default
      onUpdate={handleUpdate}
      data={datGuiData}
      {...props}
    >
      {options(Module)}
    </Module.default>
  )
}
