from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
from typing import Literal
import numpy as np
from scipy.stats import norm
from typing_extensions import Annotated

class BSOption(BaseModel):
    """Pydantic model for Black-Scholes option parameters"""
    r: Annotated[float, Field(description="Risk-free interest rate", ge=0, le=1)]
    S: Annotated[float, Field(description="Current stock price", gt=0)]
    K: Annotated[float, Field(description="Strike price", gt=0)]
    T: Annotated[float, Field(description="Time to maturity in years", gt=0)]
    sigma: Annotated[float, Field(description="Volatility", gt=0)]
    type: Literal["c", "p"] = Field(description="Option type: 'c' for Call, 'p' for Put")

    @validator('T')
    def validate_time(cls, v):
        if v > 30:  # Assuming max 30 years
            raise ValueError("Time to maturity must be less than 30 years")
        return v
    
    @validator('sigma')
    def validate_sigma(cls, v):
        if v > 5:  # 500% volatility as upper limit
            raise ValueError("Volatility seems unreasonably high")
        return v

class BSResponse(BaseModel):
    """Pydantic model for the API response"""
    option_price: float
    details: dict

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

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}