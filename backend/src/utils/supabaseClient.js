const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Key is missing from environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createServiceClient = () => {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('Supabase Service Role Key is missing');
    return createClient(supabaseUrl, serviceKey);
};

module.exports = { supabase, createServiceClient };
