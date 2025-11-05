import React from 'react';
import DevinInterface from '@/components/devin/DevinInterface';

export default function DevinPage() {
  return (
    <div className="container mx-auto py-8">
      <DevinInterface />
    </div>
  );
}

export const metadata = {
  title: 'Devin AI Integration | AgroInsight',
  description: 'Analyze pull requests, review code, and generate code using Devin AI',
};
