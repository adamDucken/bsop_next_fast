'use client'
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { bsOptionSchema } from '@/validation/bsop_scheme';
import {BSOptionInput, BSResponse} from '@/types/types';

const API_URL =  'http://172.18.0.2:8000';

export default function BSOP() {
  const [result, setResult] = useState<BSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset
  } = useForm<BSOptionInput>({
    resolver: zodResolver(bsOptionSchema)
  });

  const fields = [
    { key: 'r', label: 'Risk-Free Interest Rate', step: '0.01' },
    { key: 'S', label: 'Current Stock Price', step: '0.01' },
    { key: 'K', label: 'Strike Price', step: '0.01' },
    { key: 'T', label: 'Time to Expiration (years)', step: '0.1' },
    { key: 'sigma', label: 'Volatility', step: '0.01' }
  ] as const;

  const onSubmit = async (data: BSOptionInput) => {
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/bsop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail || 'Failed to calculate option price');
      }

      setResult(responseData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Black-Scholes Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {fields.map(({ key, label, step }) => (
              <div key={key} className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-4">
                  <Label htmlFor={key} className="w-48 text-right">{label}:</Label>
                  <Input
                    id={key}
                    type="number"
                    step={step}
                    {...register(key as keyof BSOptionInput, { 
                      valueAsNumber: true 
                    })}
                    className={errors[key as keyof BSOptionInput] ? "border-red-500" : ""}
                  />
                </div>
                {errors[key as keyof BSOptionInput] && (
                  <p className="text-red-500 text-sm ml-52">
                    {errors[key as keyof BSOptionInput]?.message}
                  </p>
                )}
              </div>
            ))}
            
            <div className="ml-52">
              <RadioGroup
                defaultValue="c"
                {...register('type')}
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
            </div>

            <Button type="submit" className="w-full">Calculate</Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-secondary rounded-md">
                <h3 className="font-semibold mb-2">Option Price</h3>
                <p className="text-xl">${result.option_price.toFixed(2)}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-secondary rounded-md">
                  <h4 className="font-semibold mb-2">Greeks</h4>
                  <div className="space-y-1">
                    <p>Delta: {result.details.delta.toFixed(4)}</p>
                    <p>Gamma: {result.details.gamma.toFixed(4)}</p>
                    <p>Theta: {result.details.theta.toFixed(4)}</p>
                    <p>Vega: {result.details.vega.toFixed(4)}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary rounded-md">
                  <h4 className="font-semibold mb-2">Parameters</h4>
                  <div className="space-y-1">
                    <p>d₁: {result.details.d1.toFixed(4)}</p>
                    <p>d₂: {result.details.d2.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}