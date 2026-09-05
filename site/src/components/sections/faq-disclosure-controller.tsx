
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import { MinusIcon } from '../icons/minus-icon'
import { PlusIcon } from '../icons/plus-icon'

type TransitionPhase = 'idle' | 'enter' | 'leave'

/** Keep the FAQ disclosure lifecycle local while preserving reversible CSS transitions. */
export function FaqDisclosureController({
  id,
  question,
  answer,
  buttonRef,
  glow = false,
}: {
  id: string
  question: ReactNode
  answer: ReactNode
  buttonRef?: RefObject<HTMLButtonElement | null>
  glow?: boolean
}) {
  const internalButtonRef = useRef<HTMLButtonElement | null>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [closed, setClosed] = useState(true)
  const [phase, setPhase] = useState<TransitionPhase>('idle')

  const clearTransitionWork = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current)
      transitionTimerRef.current = null
    }

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const toggle = useCallback(() => {
    clearTransitionWork()

    if (expanded) {
      setExpanded(false)
      setClosed(true)
      setPhase('leave')
      transitionTimerRef.current = setTimeout(() => setPhase('idle'), 300)
      return
    }

    setExpanded(true)
    setPhase('enter')

    // Start a newly mounted disclosure at the closed track, then animate it open.
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = requestAnimationFrame(() => setClosed(false))
    })
    transitionTimerRef.current = setTimeout(() => setPhase('idle'), 400)
  }, [clearTransitionWork, expanded])

  useEffect(() => clearTransitionWork, [clearTransitionWork])

  const assignButtonRef = useCallback(
    (node: HTMLButtonElement | null) => {
      internalButtonRef.current = node
      if (buttonRef) buttonRef.current = node
    },
    [buttonRef],
  )

  const panel = (
    // Preserve authored answers in the static agent document while the browser disclosure starts closed.
    <div
      id={`${id}-answer`}
      role="region"
      aria-labelledby={`${id}-question`}
      hidden={!expanded}
      data-agent-include
      data-transition={phase !== 'idle' ? '' : undefined}
      data-enter={phase === 'enter' ? '' : undefined}
      data-leave={phase === 'leave' ? '' : undefined}
      data-closed={closed ? '' : undefined}
      className="faq-disclosure"
    >
      <div className="faq-disclosure__viewport">
        <div className="faq-disclosure__body flex flex-col gap-2 pr-12 pb-6 text-sm/7 text-mist-700 dark:text-mist-400">
          {answer}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        type="button"
        ref={assignButtonRef}
        id={`${id}-question`}
        aria-controls={`${id}-answer`}
        aria-expanded={expanded}
        onClick={toggle}
        className="group flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left text-base/7 text-mist-950 dark:text-white"
      >
        {question}
        <span className="relative flex h-lh w-4 shrink-0 items-center justify-center">
          <PlusIcon className="faq-context-icon faq-context-icon--plus absolute h-lh" />
          <MinusIcon className="faq-context-icon faq-context-icon--minus absolute h-lh" />
        </span>
      </button>
      {glow ? <div className="faq-glow-trail">{panel}</div> : panel}
    </>
  )
}
