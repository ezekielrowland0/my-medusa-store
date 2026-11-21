/**
 * One-off helper — prints the production publishable API key and the
 * product count to the logs, so the storefront can be deployed on Vercel.
 * The publishable key is public by design (the storefront ships it to
 * every visitor's browser), so printing it in the deploy logs is safe.
 * It prints nothing secret: no database URL, no password, no secret key.
 *
 *   npx medusa exec ./src/scripts/print-publishable-key.ts
 */
import { Modules } from "@medusajs/framework/utils"
import type { ExecArgs } from "@medusajs/framework/types"

export default async function printPublishableKey({ container }: ExecArgs) {
  const logger = container.resolve("logger")

  const apiKeyModule = container.resolve(Modules.API_KEY)
  const keys = await apiKeyModule.listApiKeys({ type: "publishable" })
  const publishable = keys.find((k) => k.token?.startsWith("pk_")) ?? keys[0]

  if (publishable) {
    logger.info(`PUBLISHABLE_KEY=${publishable.token}`)
  } else {
    logger.info("PUBLISHABLE_KEY=NOT_FOUND")
  }

  const productModule = container.resolve(Modules.PRODUCT)
  const [, productCount] = await productModule.listAndCountProducts(
    {},
    { take: 1 }
  )
  logger.info(`PRODUCT_COUNT=${productCount}`)
}
