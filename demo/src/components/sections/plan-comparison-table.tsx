'use client'

import { ElTabGroup, ElTabList, ElTabPanels } from '@tailwindplus/elements/react'
import { clsx } from 'clsx/lite'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Container } from '../elements/container'
import { CheckmarkIcon } from '../icons/checkmark-icon'
import { MinusIcon } from '../icons/minus-icon'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

function isPlanValueRecord<Plan extends string>(
  value: ReactNode | Record<Plan, ReactNode>,
  plan: Plan
): value is Record<Plan, ReactNode> {
  return typeof value === 'object' && value !== null && plan in value
}

function FeatureGroup<Plan extends string>({
  group,
  plans,
}: {
  group: {
    title: ReactNode
    features: { name: ReactNode; value: ReactNode | Record<Plan, ReactNode> }[]
  }
  plans: Plan[]
}) {
  return (
    <tbody>
      <tr>
        <th
          colSpan={plans.length + 1}
          scope="colgroup"
          className="border-t border-b border-t-mist-950/5 border-b-mist-950/10 pt-14 pb-4 font-semibold text-mist-950 dark:border-t-white/5 dark:border-b-white/10 dark:text-white"
        >
          {group.title}
        </th>
      </tr>
      {group.features.map((feature) => (
        <tr
          key={String(feature.name)}
          className={clsx(
            'group',
            // Row highlight effect on hover
            'transition-colors duration-200',
            'hover:bg-mist-950/[0.02] dark:hover:bg-white/[0.02]',
          )}
        >
          <th
            scope="row"
            className={clsx(
              'border-t border-mist-950/5 py-4 pr-3 font-normal text-mist-700',
              'group-first:border-mist-950/10 dark:border-white/5 dark:text-mist-400 dark:group-first:border-white/10',
              // Highlight row label text on hover
              'transition-colors duration-200',
              'group-hover:text-mist-950 dark:group-hover:text-white',
            )}
          >
            {feature.name}
          </th>
          {plans.map((plan, planIndex) => {
            const value = isPlanValueRecord(feature.value, plan) ? feature.value[plan] : feature.value

            return (
              <td
                key={plan}
                data-column={planIndex}
                className={clsx(
                  'relative border-t border-mist-950/5 px-3 py-4 text-center text-mist-700',
                  'group-first:border-mist-950/10 dark:border-white/10 dark:text-mist-400 dark:group-first:border-white/10',
                  // Column highlight effect - subtle glow on hover
                  'transition-all duration-200',
                  'before:pointer-events-none before:absolute before:inset-0 before:opacity-0',
                  'before:bg-gradient-to-b before:from-mist-500/5 before:to-transparent',
                  'before:transition-opacity before:duration-200',
                  'hover:before:opacity-100',
                  'dark:before:from-mist-400/5',
                )}
              >
                {value === true ? (
                  <CheckmarkIcon aria-label="Included" className="stroke-mist-950 dark:stroke-white" />
                ) : value === false ? (
                  <MinusIcon aria-label="Not included" className="stroke-mist-950 dark:stroke-white" />
                ) : (
                  value
                )}
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}

export function PlanComparisonTable<const Plan extends string>({
  plans,
  features,
  className,
  id,
  title = 'Compare plan features',
  description = 'Scan the exact feature differences before choosing a plan.',
  ...props
}: {
  plans: Plan[]
  features: {
    title: ReactNode
    features: { name: ReactNode; value: ReactNode | Record<Plan, ReactNode> }[]
  }[]
  title?: ReactNode
  description?: ReactNode
} & ComponentProps<'section'>) {
  const { containerRef, isVisible } = useScrollAnimation({ threshold: 0.1 })
  const sectionId = id ?? 'plan-comparison'
  const headingId = `${sectionId}-heading`
  const [mobileSelectedPlan, setMobileSelectedPlan] = useState<Plan>(plans[0] ?? ('' as Plan))

  return (
    <section ref={containerRef} id={sectionId} aria-labelledby={headingId} className={clsx('py-16', className)} {...props}>
      <Container>
        <div className="mb-8 max-w-2xl">
          <h2 id={headingId} className="text-2xl/8 font-medium tracking-tight text-mist-950 dark:text-white">
            {title}
          </h2>
          <p className="mt-2 text-sm/6 text-mist-700 dark:text-mist-400">{description}</p>
        </div>

        <table
          className={clsx(
            'w-full border-collapse text-left text-sm/5 transition-all duration-700 ease-out max-sm:hidden',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          <caption className="sr-only">Feature comparison across Bulma plans</caption>
          <colgroup>
            <col className="w-2/5" />
            {plans.map((plan) => (
              <col key={plan} style={{ width: `calc(60% / ${plans.length})` }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="sticky top-(--scroll-padding-top) bg-mist-100 py-5 pr-3 text-base/7 font-medium text-mist-950 dark:bg-mist-950 dark:text-white">
                Compare features
              </th>
              {plans.map((plan, index) => (
                <th
                  key={index}
                  className="sticky top-(--scroll-padding-top) bg-mist-100 p-3 text-center font-semibold text-mist-950 dark:bg-mist-950 dark:text-white"
                >
                  {plan}
                </th>
              ))}
            </tr>
          </thead>
          {features.map((group, index) => (
            <FeatureGroup key={index} group={group} plans={plans} />
          ))}
        </table>

        <div
          className={clsx(
            'transition-all duration-700 ease-out sm:hidden',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          <ElTabGroup>
            <div className="sticky top-[calc(var(--scroll-padding-top)+0.75rem)] z-10 -mx-1 rounded-2xl bg-mist-100/90 p-1.5 shadow-sm shadow-mist-950/5 ring-1 ring-mist-950/5 backdrop-blur-xl dark:bg-mist-950/90 dark:shadow-black/20 dark:ring-white/10">
              <ElTabList className="flex gap-3 rounded-xl bg-mist-950/5 p-1 dark:bg-white/5">
                {plans.map((plan) => (
                  <button
                    key={plan}
                    id={`${sectionId}-${plan}-tab`}
                    aria-controls={`${sectionId}-${plan}-panel`}
                    type="button"
                    onClick={() => setMobileSelectedPlan(plan)}
                    onFocus={() => setMobileSelectedPlan(plan)}
                    className="relative flex-1 cursor-pointer rounded-lg px-2 py-3 text-sm/5 font-medium text-mist-500 transition-colors duration-200 aria-selected:bg-white aria-selected:text-mist-950 aria-selected:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-950/40 dark:aria-selected:bg-white/10 dark:aria-selected:text-white dark:focus-visible:ring-white/50"
                  >
                    {plan}
                  </button>
                ))}
              </ElTabList>
              <p aria-live="polite" className="px-2 pt-2 text-xs/5 font-medium text-mist-600 dark:text-mist-400">
                Viewing {mobileSelectedPlan}
              </p>
            </div>
            <ElTabPanels>
              {plans.map((plan) => (
                <table
                  key={plan}
                  id={`${sectionId}-${plan}-panel`}
                  aria-labelledby={`${sectionId}-${plan}-tab`}
                  className="mt-5 w-full border-collapse text-left text-sm/5"
                >
                  <caption className="sr-only">{plan} feature details</caption>
                  <colgroup>
                    <col className="w-3/4" />
                    <col className="w-1/4" />
                  </colgroup>
                  {features.map((group, index) => (
                    <FeatureGroup key={index} group={group} plans={[plan]} />
                  ))}
                </table>
              ))}
            </ElTabPanels>
          </ElTabGroup>
        </div>
      </Container>
    </section>
  )
}
