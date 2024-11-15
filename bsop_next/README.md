
## **Black-Scholes Option Pricer**


![BSOP](image.png)


**A shitty option pricing tool built with Next.js, Tailwind CSS, and Shadcn UI.**

### Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/adamDucken/bsop.git
   ```

2. **Install dependencies:**
   ```bash
   cd bsop
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

### Usage

- **Input:** Enter the necessary parameters ( stock price, strike price, time to maturity (years), risk-free rate , volatility ). For percentages use this format 0. for example (5% -> 0.05), everything else is decimal.
- **Output:** The tool will calculate the call and put option prices based on the Black-Scholes model.

### Future Plans

I am gonna try to rewrite the backend of this application using Python FastAPI. This will enhance performance, scalability, precision, and integration with other financial data sources.

**Note:** This project is currently in development, and features may be subject to change.

