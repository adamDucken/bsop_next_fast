from pydantic import BaseModel, Field, validator
from typing import Literal
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