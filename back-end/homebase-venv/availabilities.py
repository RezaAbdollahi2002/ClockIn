from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time, timedelta
from database import get_db
import models
from schemas import AvailabilityCreate, Availability
from datetime import datetime


router = APIRouter(prefix="/availabilities", tags=["Availabilities"])

@router.delete("/delete-availabilitiy")
def remove_availability(availability_id: int, db:Session=Depends(get_db)):
    availability = db.query(models.EmployeeAvailability).filter(models.EmployeeAvailability.id == availability_id).first()
    if not availability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="No availabilities found");
    models.EmployeeAvailability.delete(availability)
    models.EmployeeAvailability.commit()
    return {"status" : "Availability has removed successfuly."}