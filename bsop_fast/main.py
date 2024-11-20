from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import BSOption, BSResponse
from services import calculate_black_scholes

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
