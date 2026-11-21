"use client"

import { Button, Heading } from "@modules/common/components/ui"

import { convertToLocale } from "@lib/util/money"
import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const step = getCheckoutStep(cart)
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <>
      <div className="flex flex-col gap-y-4">
        <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
          Summary
        </Heading>
        <DiscountCode cart={cart} defaultOpen />
        <Divider />
        <CartTotals
          totals={cart}
          showShippingAsEstimated={!hasShippingMethod}
        />
        <LocalizedClientLink
          href={"/checkout?step=" + step}
          data-testid="checkout-button"
        >
          <Button className="w-full h-10">Go to checkout</Button>
        </LocalizedClientLink>
      </div>
      {/* Sticky checkout bar on small screens: the summary sits below the
          items on mobile, so this keeps the way forward visible while
          scrolling. Hidden on desktop, where the summary column is sticky. */}
      <div className="small:hidden fixed bottom-0 inset-x-0 z-50 bg-ivory border-t border-stone px-4 py-3">
        <div className="flex items-center gap-x-4">
          <div className="flex flex-col leading-tight">
            <span className="txt-small-plus text-ui-fg-subtle uppercase tracking-wide">
              Total
            </span>
            <span className="font-display text-xl text-ink">
              {convertToLocale({
                amount: cart.total ?? 0,
                currency_code: cart.currency_code,
              })}
            </span>
          </div>
          <LocalizedClientLink
            href={"/checkout?step=" + step}
            data-testid="mobile-checkout-button"
            className="flex-1"
          >
            <Button className="w-full h-11">Proceed to Checkout</Button>
          </LocalizedClientLink>
        </div>
      </div>
    </>
  )
}

export default Summary
