import React, { useState, useEffect, useRef } from 'react'
import p2 from 'p2'
import delay from 'delay'
import { useWindowWidth } from '@react-hook/window-size'

import randomInRange from './utils/randomInRange'

import LazyLoadDatGui from './LazyLoadDatGui'
import letters from './letters'

const viewportHeight = 1 // % of viewport
const scaleCharacter = 0.15 // scale characters within hitboxes

const breakpointMd = 900
const breakpointXl = 1600

function LetterDrop() {
  const canvasRef = useRef()
  const rafRef = useRef()
  const worldRef = useRef()

  const windowWidth = useWindowWidth(breakpointXl, {
    wait: 1500,
    leading: false,
  })

  const [datGuiData, setDatGuiData] = useState({
    gravity: -9.82,
    relaxation: 4,
    stiffness: 900,
    showHitboxes: false,
  })

  const handleUpdate = newData => setDatGuiData(newData)

  const { gravity, relaxation, stiffness, showHitboxes } = datGuiData

  // world set up, strictly run only once
  useEffect(() => {
    worldRef.current = new p2.World({
      islandSplit: true,
      // Defaults to SAPBroadphase
    })
    worldRef.current.solver.iterations = 0.1
    worldRef.current.solver.tolerance = 0.001

    const genericMaterial = new p2.Material()
    const contactMaterial = new p2.ContactMaterial(
      genericMaterial,
      genericMaterial,
    )

    worldRef.current.defaultMaterial = genericMaterial
    worldRef.current.addContactMaterial(contactMaterial)

    // https://github.com/schteppe/p2.js/issues/251
    worldRef.current.sleepMode = p2.World.BODY_SLEEPING

    // letter set up
    async function addLetters() {
      for (let letter of letters) {
        await delay(200)
        // if we unmount, break out of this loop
        if (!worldRef.current) break

        // p2 unfortunately mutates all the letters
        // which means that position and velocity is saved between mounts
        // which means that when we unmount/remount this component the letters will resume from where we left them
        // we dont want that
        // so are resetting position and velocity here, ensuring they restart with each render
        letter.position = [randomInRange(-4, 4), 8]
        letter.angularVelocity = randomInRange(-4, 4)

        worldRef.current.addBody(letter)
      }
    }

    addLetters()

    return () => {
      // I'm fairly certain this destroys P2
      // but never had confirmation; https://github.com/schteppe/p2.js/issues/353
      worldRef.current.removeContactMaterial(contactMaterial)
      worldRef.current.clear() // removes all bodies, constraints,
      worldRef.current = null
    }
  }, [])

  // dat gui mods
  useEffect(() => {
    worldRef.current.gravity = [0, gravity]
    worldRef.current.setGlobalStiffness(stiffness)
    worldRef.current.setGlobalRelaxation(relaxation)
  }, [relaxation, stiffness, gravity])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // breakpointMd screens get DPR 1, else its too much struggle on the GPU
    const DPR = windowWidth >= breakpointXl ? 1.5 : window.devicePixelRatio
    const scaleContextLg = -90 * DPR
    const scaleContextSm = -60 * DPR

    // need a wake up on resize, cos floor plane will have moved
    // worldRef.current.bodies.forEach(b => b.wakeUp())
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const w2 = windowWidth * DPR
    const h2 = window.innerHeight * viewportHeight * DPR
    canvas.width = w2
    canvas.height = h2

    ctx.lineWidth = 0.03
    ctx.font = '10px Rubik Mono One'

    let planeBody
    let mouseConstraint

    const scaleContextSize =
      windowWidth < breakpointMd ? scaleContextSm : scaleContextLg

    // Add a plane
    const planeShape = new p2.Plane()
    planeBody = new p2.Body({
      position: [0, (h2 * 0.5) / scaleContextSize],
      allowSleep: true,
    })
    planeBody.addShape(planeShape)
    worldRef.current.addBody(planeBody)

    // Create a body for the cursor
    const mouseBody = new p2.Body()
    worldRef.current.addBody(mouseBody)

    // Convert a canvas coordiante to physics coordinate
    function getPhysicsCoord(e) {
      const rect = canvas.getBoundingClientRect()
      let x = (e.clientX - rect.left) * DPR
      let y = (e.clientY - rect.top) * DPR

      x = (x - w2 * 0.5) / scaleContextSize
      y = (y - h2 * 0.5) / scaleContextSize

      return [x, y]
    }

    function drawPlane() {
      const y = planeBody.position[1]
      ctx.moveTo(-w2, y)
      ctx.lineTo(w2, y)
    }

    function drawbox(boxBody) {
      const tx = boxBody.position[0]
      const ty = boxBody.position[1]

      // reset boxBody if out of bounds on the X axis
      if (Math.abs(tx) > 10) {
        boxBody.position[0] = randomInRange(-5, 5)
        boxBody.position[1] = 10
        boxBody.velocity[0] = randomInRange(-2, 2)
        boxBody.velocity[1] = randomInRange(0, 2)
        boxBody.angularVelocity = randomInRange(-5, 5)
      }

      ctx.save()
      ctx.translate(tx, ty) // Translate to the center of the box
      ctx.rotate(boxBody.angle) // Rotate to the box body frame

      if (showHitboxes) {
        const boxShape = boxBody.shapes[0]
        ctx.rect(
          -boxShape.width / 2,
          -boxShape.height / 2,
          boxShape.width,
          boxShape.height,
        )
      }

      ctx.fillStyle = boxBody.fillStyle

      ctx.scale(scaleCharacter, scaleCharacter)
      ctx.rotate(Math.PI)
      ctx.fillText(boxBody.letter, boxBody.bBoxX, boxBody.bBoxY)
      ctx.restore()
    }

    const onPointerDown = function(e) {
      // dismiss clicks from right or middle buttons
      const mouseButton = e.button
      if (mouseButton && (mouseButton !== 0 && mouseButton !== 1)) return

      // Convert the canvas coordinate to physics coordinates
      const position = getPhysicsCoord(e)

      // Check if the cursor is inside a body
      const hitBodies = worldRef.current.hitTest(
        position,
        worldRef.current.bodies.map(b => b),
      )

      if (hitBodies.length) {
        // Move the mouse body to the cursor position
        mouseBody.position[0] = position[0]
        mouseBody.position[1] = position[1]

        // This constraint lets the bodies rotate around a common point
        mouseConstraint = new p2.RevoluteConstraint(mouseBody, hitBodies[0], {
          worldPivot: position,
          collideConnected: false,
        })
        worldRef.current.addConstraint(mouseConstraint)
      }
    }

    const onMove = function(e) {
      const position = getPhysicsCoord(e.touches ? e.touches[0] : e)
      mouseBody.position[0] = position[0]
      mouseBody.position[1] = position[1]
    }

    const onUp = function() {
      worldRef.current.removeConstraint(mouseConstraint)
      mouseConstraint = null
    }

    document.addEventListener('pointerdown', onPointerDown, {
      passive: true,
      capture: false,
    })
    document.addEventListener('mousemove', onMove, {
      passive: true,
      capture: false,
    })
    document.addEventListener('touchmove', onMove, {
      passive: true,
      capture: false,
    })
    document.addEventListener('mouseup', onUp, {
      passive: true,
      capture: false,
    })
    document.addEventListener('touchend', onUp, {
      passive: true,
      capture: false,
    })

    function render() {
      // Clear the canvas
      ctx.clearRect(0, 0, w2, h2)

      // Transform the canvas
      ctx.save()
      ctx.translate(w2 * 0.5, h2 * 0.5) // Translate to the center
      ctx.scale(scaleContextSize, scaleContextSize)

      ctx.beginPath()

      // Draw all bodies
      worldRef.current.bodies.forEach(body => {
        if (!body.letter) return // bodies can include the plane and joints, we dont want those
        drawbox(body)
      })

      drawPlane()

      if (showHitboxes) {
        ctx.strokeStyle = 'blue'
        ctx.stroke()
      }

      // Restore transform
      ctx.restore()
    }

    // smaller devices look better with the simulation a little bit faster
    const timeStep = 45

    function animate() {
      rafRef.current = requestAnimationFrame(animate)
      worldRef.current.step(1 / timeStep)
      render()
    }

    animate()

    return () => {
      window.cancelAnimationFrame(rafRef.current)
      document.removeEventListener('pointerdown', onPointerDown, {
        passive: true,
        capture: false,
      })
      document.removeEventListener('mousemove', onMove, {
        passive: true,
        capture: false,
      })
      document.removeEventListener('touchmove', onMove, {
        passive: true,
        capture: false,
      })
      document.removeEventListener('mouseup', onUp, {
        passive: true,
        capture: false,
      })
      document.removeEventListener('touchend', onUp, {
        passive: true,
        capture: false,
      })
    }
  }, [windowWidth, showHitboxes])

  return (
    <div className="outer">
      <canvas ref={canvasRef} className="canvas" />

      <LazyLoadDatGui
        handleUpdate={handleUpdate}
        datGuiData={datGuiData}
        style={{ bottom: 'initial' }}
        options={Module => [
          <Module.DatNumber
            key="gravity"
            path="gravity"
            label="gravity"
            min={-20}
            max={4}
            step={0.01}
          />,
          <Module.DatNumber
            key="relaxation"
            path="relaxation"
            label="relaxation"
            min={0.05}
            max={4}
            step={0.01}
          />,
          <Module.DatNumber
            key="stiffness"
            path="stiffness"
            label="stiffness"
            min={20}
            max={2000}
            step={1}
          />,
          <Module.DatBoolean
            key="showHitboxes"
            path="showHitboxes"
            label="showHitboxes"
          />,
        ]}
      />
    </div>
  )
}

export default LetterDrop
