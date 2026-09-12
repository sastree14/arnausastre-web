import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

async function removeBg(inputFile, outputFile, tolerance = 35) {
  const inputPath = join(root, 'public', 'brand', inputFile)
  const outputPath = join(root, 'public', 'brand', outputFile)

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Sample background color from top-left corner
  const bgR = data[0], bgG = data[1], bgB = data[2]
  console.log(`[${inputFile}] background sample: rgb(${bgR}, ${bgG}, ${bgB})`)

  const pixels = new Uint8Array(data)
  let changed = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    const dist = Math.sqrt(
      (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
    )
    if (dist <= tolerance) {
      pixels[i + 3] = Math.round(Math.min(255, (dist / tolerance) ** 1.5 * 255))
      changed++
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  console.log(`[${inputFile}] ${changed} pixels made transparent → ${outputFile}`)
}

await removeBg('logo-horizontal.png', 'logo-horizontal-transparent.png')
await removeBg('Monograma-simple.png', 'Monograma-transparent.png')