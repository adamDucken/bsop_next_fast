//app/api/bsop/route.ts
import { NextResponse } from 'next/server';
import Decimal from 'decimal.js';

// Set the precision (adjust as needed)
Decimal.set({ precision: 20 });

// Normal cumulative distribution function
function normCDF(x: Decimal): Decimal {
  const a1 = new Decimal('0.254829592');
  const a2 = new Decimal('-0.284496736');
  const a3 = new Decimal('1.421413741');
  const a4 = new Decimal('-1.453152027');
  const a5 = new Decimal('1.061405429');
  const p = new Decimal('0.3275911');

  const sign = x.isNegative() ? new Decimal(-1) : new Decimal(1);
  x = x.abs();

  const t = new Decimal(1).div(new Decimal(1).plus(p.times(x)));
  const y = new Decimal(1).minus(
    ((((a5.times(t).plus(a4)).times(t).plus(a3)).times(t).plus(a2)).times(t).plus(a1))
      .times(t)
      .times(Decimal.exp(x.neg().times(x).div(2)))
      .div(Decimal.sqrt(new Decimal(2).times(Decimal.acos(-1))))
  );

  return new Decimal(0.5).times(new Decimal(1).plus(sign.times(y)));
}

function blackScholes(r: Decimal, S: Decimal, K: Decimal, T: Decimal, sigma: Decimal, type: string): Decimal {
  const sqrtT = Decimal.sqrt(T);
  const d1 = Decimal.ln(S.div(K)).plus(r.plus(sigma.pow(2).div(2)).times(T)).div(sigma.times(sqrtT));
  const d2 = d1.minus(sigma.times(sqrtT));

  let price: Decimal;
  if (type === "c") {
    price = S.times(normCDF(d1)).minus(K.times(Decimal.exp(r.neg().times(T))).times(normCDF(d2)));
  } else if (type === "p") {
    price = K.times(Decimal.exp(r.neg().times(T))).times(normCDF(d2.neg())).minus(S.times(normCDF(d1.neg())));
  } else {
    throw new Error("Invalid option type. Use 'c' for Call or 'p' for Put.");
  }

  return price;
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received body:', body);  // Log the received body

    const { r, S, K, T, sigma, type } = body;

    // Validate inputs
    const missingParams = ['r', 'S', 'K', 'T', 'sigma', 'type'].filter(param => body[param] === undefined);
    if (missingParams.length > 0) {
      console.log(`Missing parameters: ${missingParams.join(', ')}`);
      return NextResponse.json({ error: `Missing required parameters: ${missingParams.join(', ')}` }, { status: 400 });
    }

    if (type !== 'c' && type !== 'p') {
      console.log("Invalid option type:", type);
      return NextResponse.json({ error: 'Invalid option type. Use "c" for Call or "p" for Put.' }, { status: 400 });
    }

    // Convert inputs to Decimal
    const rDecimal = new Decimal(r);
    const SDecimal = new Decimal(S);
    const KDecimal = new Decimal(K);
    const TDecimal = new Decimal(T);
    const sigmaDecimal = new Decimal(sigma);

    // Calculate option price
    const optionPrice = blackScholes(rDecimal, SDecimal, KDecimal, TDecimal, sigmaDecimal, type);

    console.log('Calculation successful. Option price:', optionPrice.toString());

    // Return the result
    return NextResponse.json({ 
      optionPrice: optionPrice.toString(),
      params: { r, S, K, T, sigma, type }
    });

  } catch (error) {
    console.error('Error in Black-Scholes calculation:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}