// Importa a função de criação do client Supabase via CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// Cria o client com a URL e a chave fornecidas
export const supabase = createClient(
  'https://izqrqllggskivqxcojfs.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cXJxbGxnZ3NraXZxeGNvamZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTE2MDEsImV4cCI6MjA4NzY4NzYwMX0.X6QJoBIo_coFXxw7C7EyQwXuEzTIPkCwPlefbiWZx_I'
)
