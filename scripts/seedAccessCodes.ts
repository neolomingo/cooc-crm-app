import { supabase } from './supabaseClient.js';
import { hashAccessCode } from '../frontend/src/lib/hash.js'; // use .js for Node

const seedAccessCodes = async () => {
  const ADMIN_CODE = 'ADMIN-SECRET-2025';
  const MANAGER_CODE = 'MANAGER-ACCESS-888';

  const hashedAdmin = await hashAccessCode(ADMIN_CODE);
  const hashedManager = await hashAccessCode(MANAGER_CODE);

  const { error: adminError } = await supabase.from('access_codes').insert({
    role: 'admin',
    code: hashedAdmin,
    created_by: null,
  });

  if (adminError) console.error('❌ Admin insert failed:', adminError);
  else console.log('✅ Admin code seeded');

  const { error: managerError } = await supabase.from('access_codes').insert({
    role: 'manager',
    code: hashedManager,
    created_by: null,
  });

  if (managerError) console.error('❌ Manager insert failed:', managerError);
  else console.log('✅ Manager code seeded');
};

seedAccessCodes();



