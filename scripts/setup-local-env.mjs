import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomBytes } from 'node:crypto'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const files = [
    ['api/.env.local.example', 'api/.env.local'],
    ['web/.env.local.example', 'web/.env.local']
]

for (const [source, destination] of files) {
    const sourcePath = resolve(root, source)
    const destinationPath = resolve(root, destination)

    try {
        await readFile(destinationPath)
        process.stdout.write(`${destination} já existe; mantido sem alterações.\n`)
    } catch {
        await mkdir(dirname(destinationPath), { recursive: true })
        await copyFile(sourcePath, destinationPath)

        if (destination === 'api/.env.local') {
            const content = await readFile(destinationPath, 'utf8')
            await writeFile(
                destinationPath,
                content.replace(
                    'substitua-por-um-segredo-local-unico',
                    randomBytes(32).toString('hex')
                )
            )
        }

        process.stdout.write(`${destination} criado.\n`)
    }
}
