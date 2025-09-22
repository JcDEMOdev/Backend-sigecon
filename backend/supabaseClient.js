const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dixnalbvuonkqoycuoqv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeG5hbGJ2dW9ua3FveWN1b3F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ5NTQ4OSwiZXhwIjoyMDc0MDcxNDg5fQ.4ZQI9701OQ8Z4ZB6vC5kQnIIa2uba4lOY677Sd2ej4g'; // Use a chave SERVICE ROLE para backend!

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };