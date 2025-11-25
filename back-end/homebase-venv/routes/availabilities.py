from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date, time, timedelta, datetime
from database import get_db
import models
import schemas



router = APIRouter(prefix="/availabilities", tags=["Availabilities"])

@router.post("/create", response_model=schemas.AvailabilityRead)
def create_availability(request: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    """Create a new employee availability"""
    new_availability = models.EmployeeAvailability(**request.dict())
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return new_availability


@router.get("/employee/{employee_id}", response_model=List[schemas.AvailabilityRead])
def get_employee_availabilities(employee_id: int, db: Session = Depends(get_db)):
    """Get all availabilities for a specific employee"""
    availabilities = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.employee_id == employee_id
    ).all()
    
    if not availabilities:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No availabilities found for this employee"
        )
    return availabilities


@router.get("/{availability_id}", response_model=schemas.AvailabilityRead)
def get_availability(availability_id: int, db: Session = Depends(get_db)):
    """Get a specific availability by ID"""
    availability = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    return availability


@router.put("/{availability_id}", response_model=schemas.AvailabilityRead)
def update_availability(
    availability_id: int,
    update_data: schemas.AvailabilityUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing availability"""
    availability = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    # Update only provided fields
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(availability, field, value)
    
    db.commit()
    db.refresh(availability)
    return availability


@router.delete("/{availability_id}")
def delete_availability(availability_id: int, db: Session = Depends(get_db)):
    """Delete an availability"""
    availability = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    db.delete(availability)
    db.commit()
    return {"status": "success", "message": "Availability deleted successfully"}


@router.put("/{availability_id}/status")
def update_availability_status(
    availability_id: int,
    status_value: str = Query(..., description="New status: pending, approved, or rejected"),
    db: Session = Depends(get_db)
):
    """Update availability status (for employer approval)"""
    availability = db.query(models.EmployeeAvailability).filter(
        models.EmployeeAvailability.id == availability_id
    ).first()
    
    if not availability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Availability not found"
        )
    
    if status_value not in ["pending", "approved", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'pending', 'approved', or 'rejected'"
        )
    
    availability.status = status_value
    db.commit()
    db.refresh(availability)
    return availability