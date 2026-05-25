import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Categorias — Admin",
}

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categorias</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories?.map((cat) => (
          <Card key={cat.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{cat.name}</p>
                <p className="text-xs text-muted-foreground">/{cat.slug}</p>
              </div>
              <Badge variant={cat.is_active ? "default" : "secondary"}>
                {cat.is_active ? "Ativa" : "Inativa"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
