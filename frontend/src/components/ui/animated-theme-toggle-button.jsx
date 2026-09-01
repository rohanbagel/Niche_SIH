import { useEffect, useRef, useState, useCallback } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

function useThemeState() {
  const [darkMode, setDarkMode] = useState(
    () =>
      typeof window !== "undefined"
        ? document.documentElement.getAttribute("data-theme") === "dark"
        : false
  )

  useEffect(() => {
    const sync = () => setDarkMode(document.documentElement.getAttribute("data-theme") === "dark")
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  return [darkMode, setDarkMode]
}

function triggerThemeTransition(type) {
  if (type === "horizontal") {
    document.documentElement.animate(
      {
        clipPath: [
          "inset(50% 0 50% 0)",
          "inset(0 0 0 0)"
        ]
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  } else if (type === "vertical") {
    document.documentElement.animate(
      {
        clipPath: [
          "inset(0 50% 0 50%)",
          "inset(0 0 0 0)"
        ]
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }
}

export const AnimatedThemeToggleButton = ({
  type = "horizontal",
  className
}) => {
  const buttonRef = useRef(null)
  const [darkMode, setDarkMode] = useThemeState()

  const handleToggle = useCallback(async () => {
    if (!buttonRef.current) return

    // Fallback for browsers that don't support View Transitions
    if (!document.startViewTransition) {
      const toggled = !darkMode
      setDarkMode(toggled)
      document.documentElement.setAttribute("data-theme", toggled ? "dark" : "light")
      localStorage.setItem("theme", toggled ? "dark" : "light")
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        const toggled = !darkMode
        setDarkMode(toggled)
        document.documentElement.setAttribute("data-theme", toggled ? "dark" : "light")
        localStorage.setItem("theme", toggled ? "dark" : "light")
      })
    }).ready

    triggerThemeTransition(type)
  }, [darkMode, type, setDarkMode])

  return (
    <button
      ref={buttonRef}
      onClick={handleToggle}
      aria-label={`Toggle theme - ${type}`}
      type="button"
      // Using standard CSS classes for our brutalist theme instead of Tailwind, 
      // but wrapping in cn() to allow overrides as requested by the original component design.
      className={cn(
        "brutalist-button", // Our custom brutalist class from index.css
        className
      )}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: 44, 
        height: 44,
        padding: 0
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, scale: 0.55, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Sun size={20} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, scale: 0.55, rotate: -25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.33 }}
          >
            <Moon size={20} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
