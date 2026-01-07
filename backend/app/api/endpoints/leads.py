from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ...models import Lead
from ...db import get_session

router = APIRouter()

@router.get("", response_model=List[Lead])
def get_leads(session: Session = Depends(get_session)):
    leads = session.exec(select(Lead)).all()
    return leads

@router.get("/{lead_id}", response_model=Lead)
def get_lead(lead_id: int, session: Session = Depends(get_session)):
    lead = session.get(Lead, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead
