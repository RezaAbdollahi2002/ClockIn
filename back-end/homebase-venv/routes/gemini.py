from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os
import json
from datetime import datetime, timedelta, time
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from models import EmployeeAvailability, Employee, Shift, ShiftStatus, PublishStatus

load_dotenv()

router = APIRouter(prefix="/gemini", tags=["Gemini"])

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class Prompt(BaseModel):
    text: str

class AutoShiftRequest(BaseModel):
    employer_id: int
    start_date: str
    end_date: str
    roles: Optional[List[str]] = ["General Staff"]
    location: Optional[str] = None
    shifts_per_day: Optional[int] = 2
    hours_per_shift: Optional[int] = 8
    additional_instructions: Optional[str] = None


@router.post("/generate")
async def generate_text(prompt: Prompt):
    """
    Sends a prompt to Google Gemini and returns the response.
    valid :
{
  "employer_id": 1,
  "start_date": "2025-12-20",
  "end_date": "2025-12-21",
  "roles": [
    "Lifeguard"
  ],
  "location": "Erie",
  "shifts_per_day": 1,
  "hours_per_shift": 1,
  "additional_instructions": "shifts."
}
    """
    model = genai.GenerativeModel("gemini-2.5-pro")
    response = model.generate_content(prompt.text)
    return {"response": response.text}


@router.post("/auto-generate-shifts")
async def auto_generate_shifts(
    request: AutoShiftRequest,
    db: Session = Depends(get_db)
):
    """
    Automatically generate shifts.
    """
    
    employees = db.query(Employee).filter(Employee.employer_id == request.employer_id).all()
    
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No employees found for this employer"
        )
    
    availability_data = []
    employees_with_availability = []
    employees_without_availability = []
    
    for employee in employees:
        availabilities = db.query(EmployeeAvailability).filter(
            EmployeeAvailability.employee_id == employee.id
        ).all()
        
        approved_availabilities = [a for a in availabilities if a.status == "approved"]
        
        employee_info = {
            "employee_id": employee.id,
            "name": f"{employee.first_name} {employee.last_name}",
            "availabilities": []
        }
        
        for avail in approved_availabilities:
            avail_dict = {
                "type": avail.type.value,
                "start_date": str(avail.start_date),
                "end_date": str(avail.end_date) if avail.end_date else None,
                "weekly_schedule": {
                    "monday": {"start": str(avail.monday_start) if avail.monday_start else None, "end": str(avail.monday_end) if avail.monday_end else None},
                    "tuesday": {"start": str(avail.tuesday_start) if avail.tuesday_start else None, "end": str(avail.tuesday_end) if avail.tuesday_end else None},
                    "wednesday": {"start": str(avail.wednesday_start) if avail.wednesday_start else None, "end": str(avail.wednesday_end) if avail.wednesday_end else None},
                    "thursday": {"start": str(avail.thursday_start) if avail.thursday_start else None, "end": str(avail.thursday_end) if avail.thursday_end else None},
                    "friday": {"start": str(avail.friday_start) if avail.friday_start else None, "end": str(avail.friday_end) if avail.friday_end else None},
                    "saturday": {"start": str(avail.saturday_start) if avail.saturday_start else None, "end": str(avail.saturday_end) if avail.saturday_end else None},
                    "sunday": {"start": str(avail.sunday_start) if avail.sunday_start else None, "end": str(avail.sunday_end) if avail.sunday_end else None}
                }
            }
            employee_info["availabilities"].append(avail_dict)
        
        if employee_info["availabilities"]:
            availability_data.append(employee_info)
            employees_with_availability.append(employee.first_name + " " + employee.last_name)
        else:
            employees_without_availability.append(employee.first_name + " " + employee.last_name)
    
    if not availability_data:
        detail_message = f"No approved availabilities found. Total employees: {len(employees)}."
        if employees_without_availability:
            detail_message += f" Employees without approved availability: {', '.join(employees_without_availability)}."
        detail_message += " Please ensure employees have submitted and you have approved their availabilities."
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail_message
        )
    
        
    prompt = f"""
You are a scheduling assistant. Create an optimal work schedule based on the following employee availabilities.

**Schedule Requirements:**
- Start Date: {request.start_date}
- End Date: {request.end_date}
- Roles to fill: {', '.join(request.roles)}
- Location: {request.location or 'Default Location'}
- Shifts per day: {request.shifts_per_day}
- Hours per shift: {request.hours_per_shift}

**Employee Availabilities:**
{json.dumps(availability_data, indent=2)}

**Additional Instructions:**
{request.additional_instructions or 'Distribute shifts fairly among employees, respecting their availability windows.'}

**Output Format:**
Return ONLY a valid JSON array of shift objects. Each shift must have this exact structure:
[
  {{
    "employee_id": <int>,
    "role": "<role name>",
    "title": "<descriptive shift title>",
    "description": "<optional description>",
    "start_time": "<YYYY-MM-DD HH:MM:SS>",
    "end_time": "<YYYY-MM-DD HH:MM:SS>"
  }}
]

**Important Rules:**
1. Only schedule employees during their available times
2. Respect the type field - do not schedule during "unavailable" periods
3. No overlapping shifts for the same employee
4. Create shifts within the date range provided
5. Return ONLY the JSON array, no additional text or markdown
6. Ensure all times are within employee availability windows
7. Use 24-hour time format
"""
    
    try:
        model = genai.GenerativeModel("gemini-2.5-pro")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        
        original_response = response_text
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        shifts_data = json.loads(response_text)
        
        if not shifts_data or len(shifts_data) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Gemini returned no shifts. This might be because no employees are available during the requested time period. Original response: {original_response[:1000]}"
            )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse Gemini response as JSON: {str(e)}\n\nResponse: {response_text[:500]}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calling Gemini API: {str(e)}"
        )
    
    created_shifts = []
    errors = []
    
    for shift_data in shifts_data:
        try:
            if not all(k in shift_data for k in ["employee_id", "role", "title", "start_time", "end_time"]):
                errors.append(f"Missing required fields in shift: {shift_data}")
                continue
            
            start_time = datetime.strptime(shift_data["start_time"], "%Y-%m-%d %H:%M:%S")
            end_time = datetime.strptime(shift_data["end_time"], "%Y-%m-%d %H:%M:%S")
            
            overlapping = db.query(Shift).filter(
                Shift.employee_id == shift_data["employee_id"],
                Shift.start_time < end_time,
                Shift.end_time > start_time
            ).first()
            
            if overlapping:
                errors.append(f"Overlapping shift for employee {shift_data['employee_id']} at {start_time}")
                continue
            
            new_shift = Shift(
                employee_id=shift_data["employee_id"],
                employer_id=request.employer_id,
                role=shift_data["role"],
                location=request.location or shift_data.get("location", "Default Location"),
                title=shift_data["title"],
                description=shift_data.get("description", "Auto-generated shift"),
                start_time=start_time,
                end_time=end_time,
                status=ShiftStatus.scheduled,
                publish_status=PublishStatus.unpublished
            )
            
            db.add(new_shift)
            created_shifts.append({
                "employee_id": new_shift.employee_id,
                "title": new_shift.title,
                "start_time": str(new_shift.start_time),
                "end_time": str(new_shift.end_time)
            })
            
        except Exception as e:
            errors.append(f"Error creating shift: {str(e)} - Data: {shift_data}")
    
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving shifts to database: {str(e)}"
        )
    
    return {
        "success": True,
        "shifts_created": len(created_shifts),
        "shifts": created_shifts,
        "errors": errors if errors else None,
        "debug_info": {
            "employees_with_availability": employees_with_availability,
            "total_employees": len(employees),
            "gemini_response": original_response[:500] if 'original_response' in locals() else None
        }
    }
