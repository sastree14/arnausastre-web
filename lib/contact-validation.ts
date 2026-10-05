export type ContactInput = {
  name: string;
  company: string;
  email: string;
  message: string;
  language: string;
  sourcePath: string;
  requestId?: string;
};
export function validateContact(
  body: unknown,
): { data: ContactInput } | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { error: "Invalid request body" };
  const raw = body as Record<string, unknown>;
  for (const key of ["name", "email", "message"])
    if (typeof raw[key] !== "string")
      return { error: "Invalid required fields" };
  for (const key of [
    "company",
    "language",
    "sourcePath",
    "website",
    "requestId",
  ])
    if (raw[key] !== undefined && typeof raw[key] !== "string")
      return { error: "Invalid field type" };
  const name = (raw.name as string).trim(),
    company = String(raw.company || "").trim(),
    email = (raw.email as string).trim(),
    message = (raw.message as string).trim();
  if (!name || !email || !message) return { error: "Missing required fields" };
  if (
    name.length > 120 ||
    company.length > 200 ||
    email.length > 254 ||
    message.length > 10000
  )
    return { error: "Field length exceeded" };
  if (/[\r\n\u0000]/.test(name + company + email) || message.includes("\u0000"))
    return { error: "Invalid characters" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Invalid email address" };
  const requestId = String(raw.requestId || "");
  if (
    requestId &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      requestId,
    )
  )
    return { error: "Invalid request identifier" };
  const path = String(raw.sourcePath || "/contact").split(/[?#]/)[0];
  return {
    data: {
      name,
      company,
      email,
      message,
      requestId: requestId || undefined,
      language: ["es", "ca", "en"].includes(String(raw.language))
        ? String(raw.language)
        : "es",
      sourcePath:
        path.startsWith("/") && !path.startsWith("//")
          ? path.slice(0, 250)
          : "/contact",
    },
  };
}
