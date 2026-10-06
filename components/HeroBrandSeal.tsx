import Image from 'next/image'

/** A restrained signature shared by the main public page introductions. */
export default function HeroBrandSeal() {
  return (
    <div className="hero-brand-seal site-container">
      <div className="hero-brand-signature" aria-label="SC-Analytics">
        <Image src="/brand/Monograma-transparent.png" alt="" width={254} height={227} className="hero-brand-monogram" />
        <span>SC-Analytics</span>
      </div>
    </div>
  )
}
