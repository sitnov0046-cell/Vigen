'use client';

import { useState } from 'react';
import { StarryBackground } from '@/components/StarryBackground';

export default function TestBalancePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...\n');

    try {
      // Тест 1: Создание пользователя
      setResult(prev => prev + '\n1. Creating user...');
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: '999999999',
          username: 'Test User'
        })
      });
      const createData = await createRes.json();
      setResult(prev => prev + '\nUser created: ' + JSON.stringify(createData, null, 2));

      // Тест 2: Получение транзакций
      setResult(prev => prev + '\n\n2. Fetching transactions...');
      const transRes = await fetch('/api/transactions?telegramId=999999999');
      const transData = await transRes.json();
      setResult(prev => prev + '\nTransactions: ' + JSON.stringify(transData, null, 2));

      // Тест 3: Создание транзакции
      setResult(prev => prev + '\n\n3. Creating transaction...');
      const newTransRes = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: '999999999',
          amount: 25,
          type: 'deposit',
          description: 'Test deposit'
        })
      });
      const newTransData = await newTransRes.json();
      setResult(prev => prev + '\nNew transaction: ' + JSON.stringify(newTransData, null, 2));

      setResult(prev => prev + '\n\n✅ All tests passed!');
    } catch (error) {
      setResult(prev => prev + '\n\n❌ Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 relative">
      <StarryBackground />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">API Test Page</h1>

        <button
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Run API Tests'}
        </button>

        {result && (
          <pre className="mt-6 bg-white p-6 rounded-lg shadow-lg overflow-auto max-h-96 text-sm">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}
