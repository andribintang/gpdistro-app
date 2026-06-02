import { prisma } from "@/lib/prisma";
import { DEFAULT_THEME, isValidTheme } from "@/lib/themes";

export async function getActiveTheme(): Promise<string> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "theme" } });
    const v = s?.value ?? DEFAULT_THEME;
    return isValidTheme(v) ? v : DEFAULT_THEME;
  } catch {
    // tabel Setting belum dibuat (perlu `prisma db push`) → pakai default
    return DEFAULT_THEME;
  }
}

export async function setActiveTheme(id: string) {
  await prisma.setting.upsert({
    where: { key: "theme" },
    update: { value: id },
    create: { key: "theme", value: id },
  });
}
