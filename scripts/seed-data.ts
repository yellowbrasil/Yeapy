import { createAdminClient } from "@/lib/supabase/admin"

const admin = createAdminClient()

async function seedData() {
  console.log("🌱 Iniciando seed de dados...")

  try {
    // 1. Criar usuário de teste (anunciante)
    console.log("\n1️⃣ Criando usuário de teste...")
    const { data: userData, error: userError } = await admin.auth.admin.createUser({
      email: "anunciante@yeapy.shop",
      password: "Senha123!@#",
      email_confirm: true,
    })

    if (userError) {
      console.log("⚠️  Usuário já existe:", userError.message)
    } else {
      console.log("✅ Usuário criado:", userData.user.id)
    }

    const userId = userData?.user?.id || "existing-user-id"

    // 2. Criar empresa de teste
    console.log("\n2️⃣ Criando empresa de teste...")
    const { data: companyData, error: companyError } = await admin
      .from("companies")
      .insert({
        owner_id: userId,
        name: "Loja Teste Yeapy",
        slug: "loja-teste-yeapy",
        whatsapp: "11999999999",
        is_active: true,
        is_verified: true,
      })
      .select()
      .single()

    if (companyError && !companyError.message?.includes("duplicate")) {
      console.log("❌ Erro ao criar empresa:", companyError.message)
      return
    }

    if (companyData) {
      console.log("✅ Empresa criada:", companyData.id)
    }

    const companyId = companyData?.id || "test-company-id"

    // 3. Criar ofertas de teste
    console.log("\n3️⃣ Criando ofertas de teste...")

    const offers = [
      {
        title: "iPhone 15 Pro Max com 50% OFF",
        description: "Lançamento oficial Apple com 50% de desconto exclusivo",
        image_url: "https://images.unsplash.com/photo-1592286927505-1def25115558",
        original_price_cents: 799900,
        promotional_price_cents: 399900,
        category_id: "11129409-cd19-4944-ba1c-d8ca9a80a7ab", // Tecnologia
        city_id: "110ec0aa-da03-46bb-9758-e3ed0ddf7457", // São Paulo
      },
      {
        title: "Notebook Dell Inspiron com 40% OFF",
        description: "Processador Intel i7, 16GB RAM, SSD 512GB",
        image_url: "https://images.unsplash.com/photo-1588872657840-790ff3ec9ef5",
        original_price_cents: 349900,
        promotional_price_cents: 209900,
        category_id: "11129409-cd19-4944-ba1c-d8ca9a80a7ab",
        city_id: "110ec0aa-da03-46bb-9758-e3ed0ddf7457",
      },
      {
        title: "AirPods Pro 2ª Geração com 30% OFF",
        description: "Cancelamento ativo de ruído, som premium",
        image_url: "https://images.unsplash.com/photo-1606841837239-c5a626a37d7f",
        original_price_cents: 249900,
        promotional_price_cents: 174900,
        category_id: "11129409-cd19-4944-ba1c-d8ca9a80a7ab",
        city_id: "110ec0aa-da03-46bb-9758-e3ed0ddf7457",
      },
      {
        title: "Vestido Social Feminino com 50% OFF",
        description: "Marca premium, tamanhos P até GG",
        image_url: "https://images.unsplash.com/photo-1595777707802-c9f6c7c7fdfb",
        original_price_cents: 89900,
        promotional_price_cents: 44900,
        category_id: "256a5783-53ec-4168-9f0b-75d823e1da3f", // Moda
        city_id: "110ec0aa-da03-46bb-9758-e3ed0ddf7457",
      },
      {
        title: "Cesta Básica Premium com 35% OFF",
        description: "Alimentos selecionados, entrega rápida",
        image_url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        original_price_cents: 199900,
        promotional_price_cents: 129900,
        category_id: "c8c52172-ac15-47cb-af34-f58631f6fbaa", // Gastronomia
        city_id: "110ec0aa-da03-46bb-9758-e3ed0ddf7457",
      },
    ]

    for (const offer of offers) {
      const { data, error } = await admin
        .from("offers")
        .insert({
          ...offer,
          company_id: companyId,
          is_national: true,
          status: "active",
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.log("⚠️ Erro ao criar oferta:", error.message)
      } else {
        console.log("✅ Oferta criada:", data?.title)
      }
    }

    console.log("\n✅ Seed concluído!")
  } catch (error) {
    console.error("❌ Erro durante seed:", error)
  }
}

seedData()
