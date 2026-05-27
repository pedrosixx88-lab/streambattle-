import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Nome de usuário obrigatório" },
      { status: 400 }
    );
  }

  // Validate TikTok username format (letters, numbers, underscores, dots, 1-24 chars)
  const tiktokUsernameRegex = /^[a-zA-Z0-9._]{1,24}$/;
  if (!tiktokUsernameRegex.test(username)) {
    return NextResponse.json(
      { valid: false, message: "Formato de usuário inválido" },
      { status: 200 }
    );
  }

  try {
    // Check if TikTok profile page is accessible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://www.tiktok.com/@${encodeURIComponent(username)}`,
      {
        method: "HEAD",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    // TikTok returns 200 for valid profiles and 404 for invalid ones
    const valid = response.status === 200 || response.status === 301 || response.status === 302;

    return NextResponse.json({
      valid,
      message: valid
        ? "Usuário encontrado!"
        : "Usuário não encontrado no TikTok",
    });
  } catch {
    // If we can't reach TikTok (network error, timeout, etc.), we assume the username format is valid
    // and let the user proceed — the actual connection will be validated when the battle starts
    return NextResponse.json({
      valid: true,
      message: "Formato válido — conexão será verificada ao iniciar a batalha",
    });
  }
}
