'use client'
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BSOP() {
  const [formData, setFormData] = useState({
    r: '',
    S: '',
    K: '',
    T: '',
    sigma: '',
    type: 'c'
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setDebugInfo(null);

    // Ensure all fields are filled
    const missingFields = Object.entries(formData).filter(([key, value]) => value === '');
    if (missingFields.length > 0) {
      setError(`Missing fields: ${missingFields.map(([key]) => key).join(', ')}`);
      return;
    }

    try {
      const response = await fetch('/api/bsop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate option price');
      }

      setResult(data);
      setDebugInfo(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err.message);
    }
  };

  const fields = [
    { key: 'r', label: 'Risk-Free Interest Rate' },
    { key: 'S', label: 'Current Stock Price' },
    { key: 'K', label: 'Strike Price' },
    { key: 'T', label: 'Time to Expiration' },
    { key: 'sigma', label: 'Volatility' }
  ];

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className='text-center'>Black-Scholes Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label }) => (
              <div key={key} className="flex flex-row items-center space-x-4 mb-4">
                <Label htmlFor={key} className="w-48 text-right">{label}:</Label>
                <Input
                  id={key}
                  name={key}
                  value={formData[key]}
                  type="number"
                  step="any"
                  onChange={handleInputChange}
                  required
                  
                />
              </div>
            ))}
            <RadioGroup
              defaultValue="c"
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="c" id="c" />
                <Label htmlFor="c">Call</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="p" id="p" />
                <Label htmlFor="p">Put</Label>
              </div>
            </RadioGroup>
            <Button type="submit" className="w-full">Calculate</Button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {result && (
            <div className="mt-4 p-4 bg-secondary rounded-md">
              <h3 className="font-semibold">Result:</h3>
              <p>Option Price: {parseFloat(result.optionPrice).toFixed(2)}</p>
            </div>
          )}
          {debugInfo && (
            <div></div>
            // <div className="mt-4 p-4 bg-gray-100 rounded-md">
            //   <h3 className="font-semibold">Debug Info:</h3>
            //   <pre className="text-xs overflow-auto">{debugInfo}</pre>
            // </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}