"use client";

import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side redirect to dashboard - will happen at request time
  redirect('/dashboard');
}