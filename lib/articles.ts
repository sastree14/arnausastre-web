export interface Article {
  slug: string
  image: string
  titleEn: string
  titleEs: string
  date: string
  readingTime: number
  tagsEn: string[]
  tagsEs: string[]
  excerptEn: string
  excerptEs: string
  bodyEn: string
  bodyEs: string
}

export const articles: Article[] = [
  {
    slug: 'why-avms-struggle-with-location-value',
    image: '/insights/why-avms-struggle-with-location-value.svg',
    titleEn: 'Why Automated Property Valuation Struggles with True Location Value',
    titleEs: 'Por qué la Valoración Automatizada de Propiedades Falla con el Valor Real de la Ubicación',
    date: '2024-07-25',
    readingTime: 3,
    tagsEn: ['Real Estate', 'Machine Learning', 'Data Science'],
    tagsEs: ['Bienes Raíces', 'Aprendizaje Automático', 'Ciencia de Datos'],
    excerptEn: 'AVMs promise speed and accuracy. But their approach to location often misses critical, dynamic factors that drive true property value. This creates blind spots for lenders and investors.',
    excerptEs: 'Los AVMs prometen velocidad y precisión. Pero su enfoque de la ubicación a menudo omite factores críticos y dinámicos que impulsan el verdadero valor de la propiedad. Esto crea puntos ciegos para prestamistas e inversores.',
    bodyEn: `Automated Valuation Models (AVMs) have transformed real estate. They promise faster, more consistent property valuations. This reduces reliance on slow manual appraisals. AVMs are critical for acquisition and lending decisions. However, a common blind spot persists. Many AVMs misinterpret the true nature of location. This impacts accuracy.

**Location is not just a point on a map**

AVMs often simplify location. They use basic coordinates, postal codes, or administrative zones. These inputs are static. Real estate value stems from dynamic, hyper-local influences. These influences shape buyer demand. They affect long-term property performance.

**Beyond simple proximity metrics**

Traditional models focus on distance to amenities. They measure distance to schools or public transport. This is a limited view. Real location value includes complex spatial interactions. It considers walkability, noise pollution, future development projects. These factors are rarely simple distances.

**The invisible boundaries of micro-markets**

Official zoning maps define property use. School district lines demarcate eligibility. These are important. But real micro-markets are fluid. Neighborhoods evolve. Social dynamics shift. AVMs that rely solely on static boundaries miss these rapid changes. They cannot capture emerging value.

**Human perception of place matters**

Appraisers account for subjective qualities. They consider neighborhood "feel" or community amenities. These are intangible. AVMs struggle with these human perceptions. They are not easily quantifiable. Yet, these factors significantly impact property appeal and price. Ignoring them leads to valuation gaps.

**Richer spatial feature engineering is the solution**

Improving AVMs requires better data. It requires smarter feature engineering. This means integrating diverse spatial datasets. This includes foot traffic data, sentiment from local reviews, satellite imagery. It means understanding how humans interact with their environment.

**Building true location intelligence**

The goal is not just faster valuations. It is accurate valuations that reflect market reality. This demands AVMs that move beyond simplistic location proxies. They must embed a deeper understanding of spatial dynamics. They must capture the nuanced drivers of real estate value. This enhances deal velocity. It reduces lending risk.`,

    bodyEs: `Los Modelos de Valoración Automatizada (AVMs) han transformado el sector inmobiliario. Prometen valoraciones de propiedades más rápidas y consistentes. Esto reduce la dependencia de tasaciones manuales lentas. Los AVMs son críticos para las decisiones de adquisición y préstamo. Sin embargo, persiste un punto ciego común. Muchos AVMs interpretan erróneamente la verdadera naturaleza de la ubicación. Esto afecta la precisión.

**La ubicación no es solo un punto en un mapa**

Los AVMs a menudo simplifican la ubicación. Utilizan coordenadas básicas, códigos postales o zonas administrativas. Estas entradas son estáticas. El valor inmobiliario proviene de influencias dinámicas e hiperlocales. Estas influencias moldean la demanda del comprador. Afectan el rendimiento de la propiedad a largo plazo.

**Más allá de las métricas de proximidad simples**

Los modelos tradicionales se centran en la distancia a los servicios. Miden la distancia a escuelas o transporte público. Esta es una visión limitada. El valor real de la ubicación incluye interacciones espaciales complejas. Considera la facilidad para caminar, la contaminación acústica, los proyectos de desarrollo futuro. Estos factores rara vez son distancias simples.

**Las fronteras invisibles de los micro-mercados**

Los mapas de zonificación oficiales definen el uso de la propiedad. Las líneas de los distritos escolares demarcan la elegibilidad. Esto es importante. Pero los micro-mercados reales son fluidos. Los barrios evolucionan. Las dinámicas sociales cambian. Los AVMs que se basan únicamente en límites estáticos pierden estos cambios rápidos. No pueden capturar el valor emergente.

**Una ingeniería de características espaciales más rica es la solución**

Mejorar los AVMs requiere mejores datos. Requiere una ingeniería de características más inteligente. Esto significa integrar diversos conjuntos de datos espaciales. Esto incluye datos de tráfico peatonal, el sentimiento de las reseñas locales, imágenes satelitales. Significa comprender cómo los humanos interactúan con su entorno.

**Construyendo una verdadera inteligencia de ubicación**

El objetivo no es solo una valoración más rápida. Es una valoración precisa que refleje la realidad del mercado. Esto exige AVMs que vayan más allá de los proxies de ubicación simplistas. Deben integrar una comprensión más profunda de la dinámica espacial. Deben capturar los matices que impulsan el valor inmobiliario. Esto mejora la velocidad de las transacciones. Reduce el riesgo de préstamo.`,
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
