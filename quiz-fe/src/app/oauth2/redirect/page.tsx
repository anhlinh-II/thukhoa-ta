"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuth2RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        // Store access token (choose storage according to your security needs)
        // localStorage is simple; consider in-memory or secure cookies for production.
        localStorage.setItem('access_token', token);
      }
      // Remove query params from URL and navigate to home (or last path)
      router.replace('/');
    } catch (e) {
      console.error('Error handling OAuth2 redirect', e);
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Logging in... Redirecting you shortly.</div>
    </div>
  );
}
