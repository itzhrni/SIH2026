const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://llnkiimpfyslwsruqadm.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbmtpaW1wZnlzbHdzcnVxYWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODU5MjgyNiwiZXhwIjoyMTA0MTY4ODI2fQ.OuideEUzWVyo1C0zM6h5ZMLH3TmPtnisIJbJAWXnvRA';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
