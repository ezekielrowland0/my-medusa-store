import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import CartRecommendations from "../components/recommendations"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
  countryCode,
  inventoryByVariant,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  countryCode: string
  inventoryByVariant?: Record<string, number>
}) => {
  return (
    <div className="pt-12 pb-28 small:pb-12">
      <div className="content-container" data-testid="cart-container">
        {cart?.items?.length ? (
          <>
            <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
              <div className="flex flex-col bg-white py-6 gap-y-6">
                {!customer && (
                  <>
                    <SignInPrompt />
                    <Divider />
                  </>
                )}
                <ItemsTemplate
                  cart={cart}
                  inventoryByVariant={inventoryByVariant}
                />
              </div>
              <div className="relative">
                <div className="flex flex-col gap-y-8 sticky top-12">
                  {cart && cart.region && (
                    <>
                      <div className="bg-white py-6">
                        <Summary cart={cart} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <CartRecommendations cart={cart} countryCode={countryCode} />
          </>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
