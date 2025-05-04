// lib/hash.ts
import bcrypt from 'bcryptjs'; // ✅ use bcryptjs for frontend/browser

export const hashAccessCode = async (plainCode: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(plainCode, saltRounds);
};
