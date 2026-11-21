import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import ReturnAfterLogin from "@modules/account/components/return-after-login"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "Account",
  description: "Overview of your account activity.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = (await listOrders().catch(() => null)) || null

  if (!customer) {
    notFound()
  }

  return (
    <>
      <ReturnAfterLogin />
      <Overview customer={customer} orders={orders} />
    </>
  )
}
