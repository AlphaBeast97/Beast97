// export env's

export const PROVIDER_API_KEY = process.env.PROVIDER_API_KEY;
export const PROVIDER_BASE_URL = process.env.PROVIDER_BASE_URL;
export const JUGARI_MODEL = process.env.JUGARI_MODEL;

if (!PROVIDER_API_KEY || !PROVIDER_BASE_URL || !JUGARI_MODEL) {
  process.stderr.write(
    "Error: env file is missing or not configured properly. Please check the .env file.\n",
  );
  process.exit(1);
}
