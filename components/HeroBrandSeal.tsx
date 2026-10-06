import Image from 'next/image'

/** Use the repository's transparent white brand lockup on dark introductions. */
export default function HeroBrandSeal() {
  return (
    <div className="hero-brand-seal site-container">
      <Image src="/brand/logo-white.png" alt="SC-Analytics" width={1536} height={1024} className="hero-brand-logo" />
    </div>
  )
}
