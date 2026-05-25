import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/registro") || pathname.startsWith("/esqueci-senha")
  const isResetPage = pathname.startsWith("/redefinir-senha")
  const isPainelPage = pathname.startsWith("/painel")
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
  const isAdminLoginPage = pathname === "/admin/login"

  // Allow password reset page always
  if (isResetPage) {
    return supabaseResponse
  }

  // Admin login page: if already logged in as admin, go to admin dashboard
  if (isAdminLoginPage) {
    if (user) {
      const role = user.app_metadata?.role
      if (role === "admin") {
        const url = request.nextUrl.clone()
        url.pathname = "/admin"
        return NextResponse.redirect(url)
      }
    }
    return supabaseResponse
  }

  // Not logged in → redirect to appropriate login
  if (!user && isAdminPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  if (!user && isPainelPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Logged in + accessing admin → check admin role
  if (user && isAdminPage) {
    const role = user.app_metadata?.role
    if (role !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
  }

  // Logged in → redirect away from auth pages
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/painel"
    return NextResponse.redirect(url)
  }

  // Logged in + accessing painel → check if company is active (paid)
  if (user && isPainelPage) {
    const { data: company } = await supabase
      .from("companies")
      .select("is_active")
      .eq("owner_id", user.id)
      .single()

    // If company exists but is not active, redirect to payment
    if (company && !company.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = "/pagamento"
      return NextResponse.redirect(url)
    }

    // If no company at all, redirect to registration
    if (!company) {
      const url = request.nextUrl.clone()
      url.pathname = "/registro"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
