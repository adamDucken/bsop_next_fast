from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from scipy.stats import norm
from models import BSOption, BSResponse

app = FastAPI(
    title="Black-Scholes Option Pricing API",
    description="API for calculating option prices using the Black-Scholes model",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://172.18.0.3:3000",  # Frontend container
        "http://localhost:3000",    # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def calculate_black_scholes(r: float, S: float, K: float, T: float, sigma: float, type: str = "c") -> tuple:
    """
    Calculate Black-Scholes option price and Greeks
    
    Returns:
        tuple: (price, details dictionary with additional calculations)
    """
    try:
        d1 = (np.log(S/K) + (r + sigma**2/2)*T)/(sigma*np.sqrt(T))
        d2 = d1 - sigma*np.sqrt(T)
        
        if type == "c":
            price = S*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
            # Calculate Greeks for call option
            delta = norm.cdf(d1)
            gamma = norm.pdf(d1)/(S*sigma*np.sqrt(T))
            theta = (-S*sigma*norm.pdf(d1))/(2*np.sqrt(T)) - r*K*np.exp(-r*T)*norm.cdf(d2)
            vega = S*np.sqrt(T)*norm.pdf(d1)
            
        elif type == "p":
            price = K*np.exp(-r*T)*norm.cdf(-d2) - S*norm.cdf(-d1)
            # Calculate Greeks for put option
            delta = norm.cdf(d1) - 1
            gamma = norm.pdf(d1)/(S*sigma*np.sqrt(T))
            theta = (-S*sigma*norm.pdf(d1))/(2*np.sqrt(T)) + r*K*np.exp(-r*T)*norm.cdf(-d2)
            vega = S*np.sqrt(T)*norm.pdf(d1)
            
        details = {
            "delta": float(delta),
            "gamma": float(gamma),
            "theta": float(theta),
            "vega": float(vega),
            "d1": float(d1),
            "d2": float(d2)
        }
        
        return float(price), details
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {str(e)}")

@app.post("/api/bsop", response_model=BSResponse)
async def calculate_option_price(option: BSOption) -> BSResponse:
    """
    Calculate option price using Black-Scholes model
    
    Args:
        option (BSOption): Option parameters
        
    Returns:
        BSResponse: Option price and additional calculations
    """
    try:
        price, details = calculate_black_scholes(
            r=option.r,
            S=option.S,
            K=option.K,
            T=option.T,
            sigma=option.sigma,
            type=option.type
        )
        
        return BSResponse(option_price=price, details=details)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
