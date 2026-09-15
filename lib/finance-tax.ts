import 'server-only'

export type TaxProfile = 'spain_b2b' | 'eu_b2b_vat' | 'non_eu_b2b' | 'spain_other' | 'manual_review'

export type TaxSuggestion = {
  profile: TaxProfile
  vatRate: number
  withholdingRate: number
  ruleKey: string
  note: string
  reviewRequired: boolean
}

const EU = new Set(['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','SE'])

export function suggestTaxTreatment(input: {
  countryCode?: string | null
  vatId?: string | null
  taxProfile?: string | null
  withholdingRate?: number | null
}): TaxSuggestion {
  const country = String(input.countryCode || '').trim().toUpperCase()
  const explicit = String(input.taxProfile || '').trim()
  const withholding = Math.max(0, Number(input.withholdingRate || 0))

  if (explicit === 'spain_b2b' || country === 'ES') {
    return {
      profile: 'spain_b2b',
      vatRate: 21,
      withholdingRate: withholding,
      ruleKey: 'ES_B2B_GENERAL',
      note: 'Sugerencia operativa: IVA general español. La retención se mantiene manual porque depende del tipo de operación y del emisor/receptor.',
      reviewRequired: true,
    }
  }

  if (explicit === 'eu_b2b_vat' || (EU.has(country) && String(input.vatId || '').trim())) {
    return {
      profile: 'eu_b2b_vat',
      vatRate: 0,
      withholdingRate: 0,
      ruleKey: 'EU_B2B_REVERSE_CHARGE',
      note: 'Sugerencia operativa: prestación B2B intracomunitaria con inversión del sujeto pasivo, sujeta a validación de VAT ID y revisión fiscal.',
      reviewRequired: true,
    }
  }

  if (explicit === 'non_eu_b2b' || (country && country !== 'ES' && !EU.has(country))) {
    return {
      profile: 'non_eu_b2b',
      vatRate: 0,
      withholdingRate: 0,
      ruleKey: 'NON_EU_B2B_GENERAL',
      note: 'Sugerencia operativa: servicio B2B a cliente fuera de la UE, normalmente sin IVA español; requiere revisión de localización y naturaleza concreta del servicio.',
      reviewRequired: true,
    }
  }

  return {
    profile: 'manual_review',
    vatRate: 0,
    withholdingRate: withholding,
    ruleKey: 'MANUAL_REVIEW',
    note: 'No hay información suficiente para proponer un tratamiento fiscal fiable. Revisión manual obligatoria.',
    reviewRequired: true,
  }
}

export function calculateInvoiceAmounts(subtotal: number, vatRate: number, withholdingRate: number) {
  const safeSubtotal = Math.round(Math.max(0, subtotal) * 100) / 100
  const tax = Math.round((safeSubtotal * Math.max(0, vatRate) / 100) * 100) / 100
  const withholding = Math.round((safeSubtotal * Math.max(0, withholdingRate) / 100) * 100) / 100
  const total = Math.round((safeSubtotal + tax - withholding) * 100) / 100
  return { subtotal: safeSubtotal, tax, withholding, total }
}
