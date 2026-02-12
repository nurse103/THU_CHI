import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { username, password } = await req.json()

    // This is your project's Supabase client.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First, find the user's email from their username in the 'users' table.
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, password')
      .eq('username', username)
      .single()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Tên đăng nhập không đúng' }), { // Invalid username
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      })
    }

    // Now, attempt to sign in the user with their retrieved email and the provided password.
    // We use the regular client here, not the admin client.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    })

    if (signInError) {
      return new Response(JSON.stringify({ error: 'Mật khẩu không đúng' }), { // Invalid password
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      })
    }

    // Return the session data to the client.
    return new Response(JSON.stringify(signInData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
