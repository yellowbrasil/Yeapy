import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

export const metadata = {
  title: "Cidades — Admin",
}

export default async function AdminCitiesPage() {
  const supabase = createAdminClient()

  const { data: cities } = await supabase
    .from("cities")
    .select("*")
    .order("state")
    .order("name")

  // Agrupar por estado
  const grouped = cities?.reduce((acc: Record<string, any[]>, city) => {
    if (!acc[city.state]) acc[city.state] = []
    acc[city.state].push(city)
    return acc
  }, {}) || {}

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cidades</h1>

      {Object.entries(grouped).map(([state, stateCities]) => (
        <div key={state}>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {state}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
            {(stateCities as any[]).map((city) => (
              <Card key={city.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{city.name}</span>
                  <Badge variant={city.is_active ? "default" : "secondary"} className="text-xs">
                    {city.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
