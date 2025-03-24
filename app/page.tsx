"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchTasks } from '@/lib/graphql-client';

type Task = {
  id: string;
  name: string;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchTasks();
        setTasks(data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Using placeholder data instead.');
        // Set some placeholder tasks even when there's an error
        setTasks([
          { id: 'placeholder-1', name: 'Order Management' },
          { id: 'placeholder-2', name: 'Production Tracking' },
          { id: 'placeholder-3', name: 'Customer Management' }
        ]);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Streamline Your Print Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect directly to Printavo and manage orders, production, and customer relationships in one place
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">Watch Demo</Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          {error && (
            <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading features...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-12">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{task.name}</h3>
                  <p className="text-gray-600">Streamline your workflow with powerful print management tools.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Print Shop?</h2>
          <p className="text-xl mb-8">Start your free trial today and experience seamless print management</p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary">Start Free Trial</Button>
            <Button size="lg" variant="outline" className="text-white">Contact Sales</Button>
          </div>
        </div>
      </section>
    </div>
  );
}