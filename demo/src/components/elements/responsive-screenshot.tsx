/**
 * Render the verified Bulma application captures used on the homepage.
 *
 * Each placement uses distinct, lossless WebPs exported from the current
 * Policy Advisor interface. The focused mobile source preserves readable UI
 * text while the desktop source provides the wider product context.
 */

import { clsx } from 'clsx/lite'
import type { ComponentProps } from 'react'

interface AppScreenshotProps extends Omit<ComponentProps<'img'>, 'src' | 'srcSet' | 'width' | 'height'> {
  /** Describe the product state shown by the screenshot. */
  alt: string
  /** Control whether the browser loads the screenshot eagerly or lazily. */
  loading?: 'lazy' | 'eager'
  /** Prioritise the hero capture without affecting below-the-fold visuals. */
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Add presentation classes without changing the verified image source. */
  className?: string
}

interface VerifiedAppScreenshotProps extends AppScreenshotProps {
  /** Use the immutable public path for the approved desktop capture. */
  src: string
  /** Provide the verified desktop capture at twice the pixel density. */
  src2x: string
  /** Declare the desktop capture's exact intrinsic width. */
  width: number
  /** Declare the desktop capture's exact intrinsic height. */
  height: number
  /** Use the immutable public path for the approved mobile crop. */
  mobileSrc: string
  /** Provide the verified mobile crop at twice the pixel density. */
  mobileSrc2x: string
  /** Provide extra resolution when the mobile frame expands near its breakpoint. */
  mobileSrc3x: string
  /** Declare the mobile crop's exact intrinsic width. */
  mobileWidth: number
  /** Declare the mobile crop's exact intrinsic height. */
  mobileHeight: number
}

/**
 * Preserve the capture's intrinsic aspect ratio while allowing its marketing
 * frame to scale it down responsively.
 */
function VerifiedAppScreenshot({
  src,
  src2x,
  width,
  height,
  mobileSrc,
  mobileSrc2x,
  mobileSrc3x,
  mobileWidth,
  mobileHeight,
  alt,
  loading = 'lazy',
  fetchPriority,
  className,
  ...props
}: VerifiedAppScreenshotProps) {
  return (
    <picture className="block overflow-hidden">
      <source
        media="(max-width: 639px)"
        srcSet={`${mobileSrc} ${mobileWidth}w, ${mobileSrc2x} ${mobileWidth * 2}w, ${mobileSrc3x} ${mobileWidth * 3}w`}
        sizes="82vw"
        type="image/webp"
        width={mobileWidth}
        height={mobileHeight}
      />
      <img
        src={src}
        srcSet={`${src} 1x, ${src2x} 2x`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        className={clsx('block h-auto w-full bg-[#090b0c]', className)}
        {...props}
      />
    </picture>
  )
}


/** Show the authentic Policy Advisor workspace and its suggested questions. */
export function HeroScreenshot(props: AppScreenshotProps) {
  return (
    <VerifiedAppScreenshot
      src="/img/screenshots/bulma-policy-advisor-workspace.webp"
      src2x="/img/screenshots/bulma-policy-advisor-workspace@2x.webp"
      width={1440}
      height={900}
      mobileSrc="/img/screenshots/bulma-policy-advisor-workspace-mobile.webp"
      mobileSrc2x="/img/screenshots/bulma-policy-advisor-workspace-mobile@2x.webp"
      mobileSrc3x="/img/screenshots/bulma-policy-advisor-workspace-mobile@3x.webp"
      mobileWidth={390}
      mobileHeight={330}
      {...props}
    />
  )
}


/** Show source attribution through the application's expanded evidence ledger. */
export function FeatureScreenshotLeft(props: AppScreenshotProps) {
  return (
    <VerifiedAppScreenshot
      src="/img/screenshots/bulma-policy-evidence-ledger.webp"
      src2x="/img/screenshots/bulma-policy-evidence-ledger@2x.webp"
      width={710}
      height={510}
      mobileSrc="/img/screenshots/bulma-policy-evidence-ledger-mobile.webp"
      mobileSrc2x="/img/screenshots/bulma-policy-evidence-ledger-mobile@2x.webp"
      mobileSrc3x="/img/screenshots/bulma-policy-evidence-ledger-mobile@3x.webp"
      mobileWidth={390}
      mobileHeight={350}
      {...props}
    />
  )
}


/** Show a completed lender comparison using the application's real table UI. */
export function FeatureScreenshotRight(props: AppScreenshotProps) {
  return (
    <VerifiedAppScreenshot
      src="/img/screenshots/bulma-lender-comparison.webp"
      src2x="/img/screenshots/bulma-lender-comparison@2x.webp"
      width={840}
      height={603}
      mobileSrc="/img/screenshots/bulma-lender-comparison-mobile.webp"
      mobileSrc2x="/img/screenshots/bulma-lender-comparison-mobile@2x.webp"
      mobileSrc3x="/img/screenshots/bulma-lender-comparison-mobile@3x.webp"
      mobileWidth={350}
      mobileHeight={305}
      {...props}
    />
  )
}
