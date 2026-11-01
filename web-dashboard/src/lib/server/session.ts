export const SESSION_COOKIE = "access_token";

export const sessionCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure:
    process.env["COOKIE_SECURE"] !== undefined
      ? process.env["COOKIE_SECURE"] === "true"
      : process.env.NODE_ENV === "production",
};
