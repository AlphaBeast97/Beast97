// export env's

export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
export const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL;
export const JUGARI_MODEL = process.env.JUGARI_MODEL;

if (
  OPENROUTER_API_KEY === undefined &&
  OPENROUTER_BASE_URL === undefined &&
  JUGARI_MODEL === undefined
) {
  console.error(
    "Error: env file is missing or not configured properly. Please check the .env file.",
  );
  process.exit(1);
}
