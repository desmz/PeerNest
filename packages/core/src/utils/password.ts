import bcrypt from 'bcryptjs';

export async function encodePassword(password: string): Promise<string> {
  const genSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, genSalt);

  return hashedPassword;
}

export async function comparePassword(password: string, passwordHash: string): Promise<boolean> {
  return await bcrypt.compare(password, passwordHash);
}
