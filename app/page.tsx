"use client";

import { Button } from '@/components/ui/button';

export default function Home() {
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
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="p-6">
            <div className="h-12 w-12 bg-blue-100 rounded-lg mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-Time Order Tracking</h3>
            <p className="text-gray-600">Monitor order progress from quote to delivery with live updates</p>
          </div>
          <div className="p-6">
            <div className="h-12 w-12 bg-green-100 rounded-lg mb-4" />
            <h3 className="text-xl font-semibold mb-2">Integrated Production Tools</h3>
            <p className="text-gray-600">Manage workflows, assign tasks, and track production stages</p>
          </div>
          <div className="p-6">
            <div className="h-12 w-12 bg-purple-100 rounded-lg mb-4" />
            <h3 className="text-xl font-semibold mb-2">Customer Portal</h3>
            <p className="text-gray-600">Provide clients with self-service order tracking and approvals</p>
          </div>
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