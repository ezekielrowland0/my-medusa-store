import { Metadata } from "next"

import LoginTemplate, {
  LOGIN_VIEW,
} from "@modules/account/templates/login-template"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; next?: string }>
}) {
  const params = await searchParams

  return (
    <div className="w-full flex flex-col items-center">
      {params.next && (
        <p className="max-w-sm text-center font-display text-xl text-ink border border-stone border-l-4 border-l-brass bg-ivory px-6 py-4 mb-2">
          Create an account or sign in to continue — you need an account to
          shop with us.
        </p>
      )}
      <LoginTemplate
        defaultView={
          params.view === "register"
            ? LOGIN_VIEW.REGISTER
            : LOGIN_VIEW.SIGN_IN
        }
      />
    </div>
  )
}
