-- Yeapy — Dados iniciais

-- Categorias
insert into public.categories (name, slug, icon, sort_order) values
  ('Gastronomia', 'gastronomia', 'UtensilsCrossed', 1),
  ('Tecnologia', 'tecnologia', 'Laptop', 2),
  ('Moda', 'moda', 'Shirt', 3),
  ('Beleza', 'beleza', 'Sparkles', 4),
  ('Saude', 'saude', 'Heart', 5),
  ('Educacao', 'educacao', 'GraduationCap', 6),
  ('Casa e Decoracao', 'casa-e-decoracao', 'Home', 7),
  ('Esportes', 'esportes', 'Dumbbell', 8),
  ('Automotivo', 'automotivo', 'Car', 9),
  ('Servicos', 'servicos', 'Wrench', 10),
  ('Entretenimento', 'entretenimento', 'Music', 11),
  ('Pets', 'pets', 'PawPrint', 12);

-- Cidades RS (estado inicial)
insert into public.cities (name, state, slug) values
  ('Porto Alegre', 'RS', 'porto-alegre'),
  ('Caxias do Sul', 'RS', 'caxias-do-sul'),
  ('Bento Goncalves', 'RS', 'bento-goncalves'),
  ('Canoas', 'RS', 'canoas'),
  ('Novo Hamburgo', 'RS', 'novo-hamburgo'),
  ('Sao Leopoldo', 'RS', 'sao-leopoldo'),
  ('Pelotas', 'RS', 'pelotas'),
  ('Santa Maria', 'RS', 'santa-maria'),
  ('Gravatai', 'RS', 'gravatai'),
  ('Viamao', 'RS', 'viamao');

-- Cidades SP
insert into public.cities (name, state, slug) values
  ('Sao Paulo', 'SP', 'sao-paulo'),
  ('Campinas', 'SP', 'campinas'),
  ('Santos', 'SP', 'santos'),
  ('Guarulhos', 'SP', 'guarulhos'),
  ('Osasco', 'SP', 'osasco');

-- Cidades RJ
insert into public.cities (name, state, slug) values
  ('Rio de Janeiro', 'RJ', 'rio-de-janeiro'),
  ('Niteroi', 'RJ', 'niteroi');

-- Cidades MG
insert into public.cities (name, state, slug) values
  ('Belo Horizonte', 'MG', 'belo-horizonte'),
  ('Uberlandia', 'MG', 'uberlandia');

-- Cidades PR
insert into public.cities (name, state, slug) values
  ('Curitiba', 'PR', 'curitiba'),
  ('Londrina', 'PR', 'londrina'),
  ('Maringa', 'PR', 'maringa');

-- Cidades SC
insert into public.cities (name, state, slug) values
  ('Florianopolis', 'SC', 'florianopolis'),
  ('Joinville', 'SC', 'joinville'),
  ('Blumenau', 'SC', 'blumenau');

-- Planos
insert into public.plans (name, slug, max_active_offers, price_cents, features) values
  ('Basico', 'basico', 3, 4900, '{"destaque": false, "suporte": "email"}'),
  ('Profissional', 'profissional', 10, 9900, '{"destaque": true, "suporte": "whatsapp", "analytics": true}'),
  ('Premium', 'premium', 30, 19900, '{"destaque": true, "suporte": "prioritario", "analytics": true, "impulsionamento": true}');
