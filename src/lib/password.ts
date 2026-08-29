import bcrypt from "bcryptjs";

export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(String(password || ""), 12);
  } catch (error) {
    console.error("[auth] hashPassword failed:", error);
    throw error;
  }
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    if (!password || !hash) return false;
    return await bcrypt.compare(String(password), String(hash));
  } catch (error) {
    console.error("[auth] verifyPassword failed:", error);
    return false;
  }
}
