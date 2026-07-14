import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const demoDirectory = path.resolve(testDirectory, '..')
const repositoryDirectory = path.resolve(demoDirectory, '..')
const sourceDirectory = path.join(demoDirectory, 'src')


/**
 * Read a UTF-8 file relative to the runnable demo directory.
 *
 * @param {string} relativePath - Demo-relative file path.
 * @returns {string} File contents.
 */
function readDemoFile(relativePath) {
  return fs.readFileSync(path.join(demoDirectory, relativePath), 'utf8')
}


/**
 * Collect every implementation source file recursively.
 *
 * @param {string} directory - Directory to inspect.
 * @returns {string[]} Absolute source paths.
 */
function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath)
    }

    return /\.(?:css|js|jsx|ts|tsx)$/.test(entry.name) ? [entryPath] : []
  })
}


test('interactive source avoids broad transitions and motion-policy branches', () => {
  const source = collectSourceFiles(sourceDirectory)
    .map((filePath) => fs.readFileSync(filePath, 'utf8'))
    .join('\n')

  assert.doesNotMatch(source, /transition-all|transition\s*:\s*all/)
  assert.doesNotMatch(source, /prefers-reduced-motion/)
})


test('shared buttons enforce target sizes, exact press feedback, and static opt-out', () => {
  const source = readDemoFile('src/components/elements/button.tsx')
  const globalStyles = readDemoFile('src/app/globals.css')
  const footer = readDemoFile('src/components/sections/footer-with-newsletter-form-categories-and-social-icons.tsx')

  assert.match(source, /min-h-11 min-w-11/)
  assert.match(source, /lg:min-h-10 lg:min-w-10/)
  assert.match(source, /active:scale-\[0\.96\]/)
  assert.match(source, /transition-\[scale,background-color,box-shadow,color\]/)
  assert.match(source, /has-\[>svg:last-child\]:pr-2\.5/)
  assert.equal(source.match(/static: isStatic = false/g)?.length, 6)
  assert.equal(source.match(/!isStatic && ACTIVE_PRESS/g)?.length, 3)
  assert.match(globalStyles, /\.contact-submit-button[\s\S]*scale 150ms ease-out/)
  assert.match(footer, /transition-\[color,translate\]/)
})


test('secondary navbar controls enforce the shared responsive target sizes', () => {
  const source = readDemoFile('src/components/sections/navbar-with-logo-actions-and-left-aligned-links.tsx')

  assert.match(source, /min-h-11[^']*lg:min-h-10/)
  assert.match(source, /min-h-11 min-w-11[^']*lg:min-h-10 lg:min-w-10/)
  assert.equal(source.match(/size-11/g)?.length, 2)
})


test('FAQ disclosures and icons use reversible enter and leave contracts', () => {
  const globalStyles = readDemoFile('src/app/globals.css')
  const homepageFaq = readDemoFile('src/components/sections/faqs-two-column-accordion.tsx')
  const pricingFaq = readDemoFile('src/components/sections/faqs-accordion.tsx')

  for (const source of [homepageFaq, pricingFaq]) {
    assert.match(source, /className="faq-disclosure"/)
    assert.match(source, /faq-context-icon--plus/)
    assert.match(source, /faq-context-icon--minus/)
    assert.doesNotMatch(source, /faq-spring-content/)
  }

  assert.match(globalStyles, /\.faq-disclosure\[data-enter\][\s\S]*transition-duration: 400ms/)
  assert.match(globalStyles, /\.faq-disclosure\[data-leave\][\s\S]*transition-duration: 150ms/)
  assert.match(globalStyles, /\.faq-disclosure\[hidden\]\[data-transition\][\s\S]*display: grid !important/)
  assert.match(globalStyles, /\.faq-disclosure\[hidden\]\[data-enter\][\s\S]*transition-duration: 150ms/)
  assert.match(globalStyles, /transform: translateY\(-8px\)/)
  assert.match(globalStyles, /filter 300ms cubic-bezier\(0\.2, 0, 0, 1\)/)
  assert.match(globalStyles, /scale: 0\.25/)
  assert.match(homepageFaq, /window\.addEventListener\('hashchange', openWhenHashMatches\)/)
})


test('mobile navigation exits through transition state before native dialog close', () => {
  const globalStyles = readDemoFile('src/app/globals.css')
  const navbar = readDemoFile('src/components/sections/navbar-with-links-actions-and-centered-logo.tsx')

  assert.match(navbar, /<ElDialog className="lg:hidden">/)
  assert.match(navbar, /dialog\.close\(\)/)
  assert.match(navbar, /className="mobile-menu-panel/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-enter\]/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-leave\][\s\S]*transition-duration: 150ms/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-enter\]\[data-closed\][\s\S]*transition-duration: 150ms/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-closed\] \.mobile-menu-links > \*[\s\S]*transition-delay: 0ms/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-enter\]\[data-closed\] \.mobile-menu-links > \*[\s\S]*transition-delay: 0ms/)
  assert.match(globalStyles, /\.mobile-menu-panel\[data-closed\][\s\S]*translateY\(-12px\)/)
  assert.doesNotMatch(globalStyles, /@keyframes mobile-menu-(?:panel|link|close)-enter/)
})


test('tilt and ripple effects avoid idle compositor promotion and forced layout', () => {
  const screenshot = readDemoFile('src/components/elements/screenshot.tsx')
  const magneticWrapper = readDemoFile('src/components/elements/magnetic-wrapper.tsx')

  assert.match(screenshot, /isTiltActive && 'will-change-transform'/)
  assert.match(screenshot, /setIsTiltActive\(false\)/)
  assert.match(screenshot, /TILT_CONFIG\.resetDuration/)
  assert.doesNotMatch(screenshot, /enableTilt && 'transform-gpu will-change-transform'/)
  assert.match(magneticWrapper, /key=\{rippleKey\}/)
  assert.match(magneticWrapper, /setRippleKey\(\(currentKey\) => currentKey \+ 1\)/)
  assert.doesNotMatch(magneticWrapper, /offsetWidth|rippleTimeoutRef/)
})


test('surface geometry, media edges, and pricing focus retain comparison clarity', () => {
  const globalStyles = readDemoFile('src/app/globals.css')
  const features = readDemoFile('src/components/sections/features-two-column-with-demos.tsx')
  const pricingPage = readDemoFile('src/app/pricing/page.tsx')
  const homepage = readDemoFile('src/app/page.tsx')
  const pricingHero = readDemoFile('src/components/sections/pricing-hero-multi-tier.tsx')
  const pricingSection = readDemoFile('src/components/sections/pricing-multi-tier.tsx')
  const main = readDemoFile('src/components/elements/main.tsx')

  assert.match(features, /h-full rounded-2xl[^']*p-2/)
  assert.match(features, /overflow-hidden rounded-lg/)
  assert.match(features, /section-horizon pt-6/)
  assert.match(features, /\[&_img\]:outline-black\/10/)
  assert.match(globalStyles, /\.supported-lenders-field__button[\s\S]*min-height: 2\.75rem/)
  assert.match(globalStyles, /min-height: 2\.5rem/)
  assert.doesNotMatch(globalStyles, /pricing-focus-group:hover \.pricing-focus-card \{/)
  assert.match(globalStyles, /\.pricing-focus-group:hover \.pricing-focus-card:hover[\s\S]*translateY\(-4px\)/)
  assert.match(pricingPage, /Get 2 months free on a yearly plan\./)
  assert.match(homepage, /Get 2 months free on a yearly plan\./)
  assert.match(pricingHero, /<React\.Fragment key="cta">\{cta\}<\/React\.Fragment>/)
  assert.match(pricingSection, /<Fragment key="cta">\{cta\}<\/Fragment>/)
  assert.doesNotMatch(main, /page-transition-enter|enableTransition/)
})


test('animation architecture guide describes the current transition policy', () => {
  const guide = fs.readFileSync(path.join(repositoryDirectory, 'documents/guides/_animations.md'), 'utf8')

  assert.doesNotMatch(guide, /transition-all|prefers-reduced-motion|page-transition-enter|enableTransition/)
  assert.match(guide, /FAQ Disclosure Transitions/)
  assert.match(guide, /Pricing Card Focus Depth/)
  assert.match(guide, /data-enter`, `data-leave`, and `data-closed`/)
})


test('Tailwind longhand motion utilities transition the properties they change', () => {
  const source = collectSourceFiles(sourceDirectory)
    .map((filePath) => fs.readFileSync(filePath, 'utf8'))
    .join('\n')

  assert.doesNotMatch(source, /transition-\[transform,opacity\]/)
  assert.doesNotMatch(source, /transition-\[transform,background-color,box-shadow,color\]/)
  assert.match(readDemoFile('src/components/sections/call-to-action-simple.tsx'), /transition-\[translate,scale,opacity\]/)
  assert.match(readDemoFile('src/components/sections/faqs-accordion.tsx'), /transition-\[translate,opacity\]/)
})
