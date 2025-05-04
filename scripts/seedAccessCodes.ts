import { supabase } from '../frontend/src/lib/supabase';
import { hashAccessCode } from '../frontend/src/lib/hash';

const seedAccessCodes = async () => {
  const ADMIN_CODE = 'ADMIN-SECRET-2025';
  const MANAGER_CODE = 'MANAGER-ACCESS-888';

  const hashedAdminCode = await hashAccessCode(ADMIN_CODE);
  const hashedManagerCode = await hashAccessCode(MANAGER_CODE);

  const { data: session } = await supabase.auth.getSession();

  const adminUserId = session?.session?.user?.id;

  if (!adminUserId) {
    console.error('No admin user signed in.');
    return;
  }

  const { error: adminError } = await supabase.from('access_codes').insert({
    role: 'admin',
    code: hashedAdminCode,
    created_by: adminUserId,
  });

  const { error: managerError } = await supabase.from('access_codes').insert({
    role: 'manager',
    code: hashedManagerCode,
    created_by: adminUserId,
  });

  if (adminError || managerError) {
    console.error('Failed to insert codes:', adminError || managerError);
  } else {
    console.log('✅ Hashed access codes seeded successfully');
  }
};

seedAccessCodes();
