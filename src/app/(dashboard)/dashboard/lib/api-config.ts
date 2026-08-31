/**
 * Single source of truth for the FastAPI base URL. Every component
 * should import API_BASE from here instead of hardcoding the string -
 * this is the only place that needs to change when you deploy.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";