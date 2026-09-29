import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import ComplaintModel, ComplaintStatus
from app.providers.triage.base import Category, Priority

# 32 Realistic Urdu-English Municipal Complaints across all categories and priorities
SEED_COMPLAINTS = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000001"),
        "text": "Main water pipeline burst on Street 12 since fajr, water entering ground floors and basements.",
        "location": "Street 12, West Zone, Sector G-9",
        "reporter_contact": "ahmed.khan@example.com",
        "category": Category.WATER.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Burst water main causing ground floor flooding on Street 12.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 340,
        "offset_hours": 2,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000002"),
        "text": "WAPDA transformer spark throwing and heavy fire risk near Gali 4 corner mosque.",
        "location": "Gali 4, Block B, North Nazimabad",
        "reporter_contact": "tariq_nadeem@example.com",
        "category": Category.ELECTRICITY.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Dangerous transformer sparking with fire risk near mosque.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 280,
        "offset_hours": 5,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000003"),
        "text": "Kachra kundi overflowing near dispensary, foul smell and stray animals spreading garbage all over road.",
        "location": "Plot 45 near Civil Dispensary, Liaquatabad",
        "reporter_contact": "03001234567",
        "category": Category.SANITATION.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Overflowing garbage dump creating unhygienic conditions near dispensary.",
        "triaged_by": "rules",
        "triage_latency_ms": 5,
        "offset_hours": 8,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000004"),
        "text": "Huge crater pothole after recent rain damaging car suspensions and creating daily traffic jam.",
        "location": "Main Boulevard near Expressway interchange",
        "reporter_contact": "citizen.khi@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Large rain pothole causing traffic obstruction on Main Boulevard.",
        "triaged_by": "simulated",
        "triage_latency_ms": 12,
        "offset_hours": 12,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000005"),
        "text": "Streetlight pole wiring severed and fixture dangling dangerously over pedestrian footpath.",
        "location": "Jinnah Avenue, Sector F-10/2",
        "reporter_contact": "saad.malik@example.com",
        "category": Category.STREETLIGHTS.value,
        "priority": Priority.LOW.value,
        "status": "in_progress",
        "ai_summary": "Detached streetlight fixture dangling over pedestrian walkway.",
        "triaged_by": "rules",
        "triage_latency_ms": 4,
        "offset_hours": 15,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000006"),
        "text": "Dirty black sewage water backing up into kitchen lines since past 3 days in entire mohalla.",
        "location": "Mohalla Usmania, Street 7",
        "reporter_contact": "usman_family@example.com",
        "category": Category.WATER.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Sewage contamination entering residential drinking water supply.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 310,
        "offset_hours": 18,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000007"),
        "text": "Fallen live electric wire on road after storm, pedestrian passage completely blocked.",
        "location": "Main Market Road, Gulberg III",
        "reporter_contact": "03219876543",
        "category": Category.ELECTRICITY.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Fallen live electrical cable blocking road traffic.",
        "triaged_by": "rules:fallback",
        "triage_latency_ms": 450,
        "offset_hours": 20,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000008"),
        "text": "Sanitation sweepers have not visited this gali for two weeks, heaps of dried leaves and trash.",
        "location": "Gali 9, Satellite Town, Rawalpindi",
        "reporter_contact": "resident_st9@example.com",
        "category": Category.SANITATION.value,
        "priority": Priority.NORMAL.value,
        "status": "resolved",
        "ai_summary": "Sweeper absence leading to trash buildup on Gali 9.",
        "triaged_by": "simulated",
        "triage_latency_ms": 10,
        "offset_hours": 24,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000009"),
        "text": "Open uncovered manhole in front of Government Girls High School, severe danger for children.",
        "location": "Circular Road near Girls High School",
        "reporter_contact": "headmistress.gghs@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.HIGH.value,
        "status": "resolved",
        "ai_summary": "Uncovered manhole posing hazard outside school gate.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 330,
        "offset_hours": 30,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000010"),
        "text": "Whole street is pitch dark because 6 continuous streetlights bulbs are fused.",
        "location": "Phase 5, Street 18, DHA",
        "reporter_contact": "dha_res_18@example.com",
        "category": Category.STREETLIGHTS.value,
        "priority": Priority.LOW.value,
        "status": "resolved",
        "ai_summary": "Multiple fused streetlight bulbs on Street 18.",
        "triaged_by": "rules",
        "triage_latency_ms": 4,
        "offset_hours": 36,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000011"),
        "text": "Underground water supply valve broken, clean potable water getting wasted onto main road.",
        "location": "Service Road West, I-8/4",
        "reporter_contact": "faisal.i8@example.com",
        "category": Category.WATER.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Broken water supply valve leaking drinking water.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 290,
        "offset_hours": 40,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000012"),
        "text": "Low voltage fluctuations causing home appliances and water motors to burn out in our sector.",
        "location": "Sector C, Bahria Town",
        "reporter_contact": "03335551234",
        "category": Category.ELECTRICITY.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Persistent electrical voltage fluctuations damaging motors.",
        "triaged_by": "rules",
        "triage_latency_ms": 5,
        "offset_hours": 45,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000013"),
        "text": "Dead dog lying on central median of road near green belt, urgent disposal needed.",
        "location": "Kashmir Highway near G-11 signal",
        "reporter_contact": "commuter_kashmir@example.com",
        "category": Category.SANITATION.value,
        "priority": Priority.NORMAL.value,
        "status": "resolved",
        "ai_summary": "Animal carcass removal requested from central median.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 320,
        "offset_hours": 50,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000014"),
        "text": "Illegal speed breaker constructed without white paint or signboards, causing accidents.",
        "location": "Main University Road, Karachi",
        "reporter_contact": "student_ku@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.NORMAL.value,
        "status": "rejected",
        "ai_summary": "Unmarked speed breaker on university road.",
        "triaged_by": "simulated",
        "triage_latency_ms": 10,
        "offset_hours": 55,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000015"),
        "text": "Streetlight timer circuit faulty, lights remain turned on all day in scorching sun wasting electricity.",
        "location": "Sector I-9/3 Industrial Area",
        "reporter_contact": "i9_association@example.com",
        "category": Category.STREETLIGHTS.value,
        "priority": Priority.LOW.value,
        "status": "open",
        "ai_summary": "Faulty timer keeping industrial streetlights on during daytime.",
        "triaged_by": "rules",
        "triage_latency_ms": 5,
        "offset_hours": 60,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000016"),
        "text": "Water tanker mafia punctured municipal line to divert sweet water supply.",
        "location": "Orangi Town, Sector 11-E",
        "reporter_contact": "orangi_resident@example.com",
        "category": Category.WATER.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Illegal puncture of main water line in Orangi Town.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 350,
        "offset_hours": 65,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000017"),
        "text": "Electric pole tilted at 45 degrees towards residential gate after dumper truck collision.",
        "location": "Peshawar Road near Westridge",
        "reporter_contact": "westridge_house22@example.com",
        "category": Category.ELECTRICITY.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Tilted electric pole leaning toward residential property.",
        "triaged_by": "rules:fallback",
        "triage_latency_ms": 410,
        "offset_hours": 70,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000018"),
        "text": "Hospital biomedical waste bags dumped openly behind general ward boundary wall.",
        "location": "District Headquarters Hospital Back Gate",
        "reporter_contact": "dr.farooq@example.com",
        "category": Category.SANITATION.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Hazardous hospital medical waste dumped in public alley.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 330,
        "offset_hours": 75,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000019"),
        "text": "Paver tiles on pedestrian walk broken and uneven, elderly people falling down.",
        "location": "Mall Road near Post Office",
        "reporter_contact": "pedestrian_advocate@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.LOW.value,
        "status": "open",
        "ai_summary": "Broken pedestrian paver tiles on Mall Road.",
        "triaged_by": "simulated",
        "triage_latency_ms": 11,
        "offset_hours": 80,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000020"),
        "text": "Solar street light battery stolen from pole in community park.",
        "location": "Fatima Jinnah Park Gate 3",
        "reporter_contact": "park_walker@example.com",
        "category": Category.STREETLIGHTS.value,
        "priority": Priority.LOW.value,
        "status": "rejected",
        "ai_summary": "Stolen park solar light battery.",
        "triaged_by": "rules",
        "triage_latency_ms": 4,
        "offset_hours": 85,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000021"),
        "text": "Tube-well pump burned down in public water filtration plant, no drinking water available.",
        "location": "Union Council 14, Filtration Plant #2",
        "reporter_contact": "uc14_nazim@example.com",
        "category": Category.WATER.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Filtration plant tube-well pump breakdown.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 300,
        "offset_hours": 90,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000022"),
        "text": "Feeder breaker tripping every 20 minutes under peak afternoon heatwave.",
        "location": "Block 13-D, Gulshan-e-Iqbal",
        "reporter_contact": "gulshan_traders@example.com",
        "category": Category.ELECTRICITY.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Recurrent power feeder tripping during heatwave.",
        "triaged_by": "rules",
        "triage_latency_ms": 5,
        "offset_hours": 95,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000023"),
        "text": "Construction debris and malba left blocking half the roadway since 1 month.",
        "location": "Canal Bank Road near Thokar Niaz Baig",
        "reporter_contact": "canal_drivers@example.com",
        "category": Category.SANITATION.value,
        "priority": Priority.NORMAL.value,
        "status": "in_progress",
        "ai_summary": "Abandoned construction debris blocking traffic lane.",
        "triaged_by": "simulated",
        "triage_latency_ms": 10,
        "offset_hours": 100,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000024"),
        "text": "Bridge expansion joint rubber damaged, steel plate rattling loudly under trucks.",
        "location": "Sufi Tabassum Flyover",
        "reporter_contact": "bridge_safety@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Damaged flyover expansion joint vibrating under load.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 340,
        "offset_hours": 105,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000025"),
        "text": "Streetlight pole base rusted through, about to collapse in high wind.",
        "location": "Ring Road Toll Plaza exit ramp",
        "reporter_contact": "motorway_patrol@example.com",
        "category": Category.STREETLIGHTS.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Rusted streetlight pole base at risk of collapse.",
        "triaged_by": "rules",
        "triage_latency_ms": 4,
        "offset_hours": 110,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000026"),
        "text": "Illegal encroachment by vegetable vendors blocking municipal drainage nala.",
        "location": "Sabzi Mandi Road, Sector I-11",
        "reporter_contact": "shopkeepers_union@example.com",
        "category": Category.OTHER.value,
        "priority": Priority.NORMAL.value,
        "status": "open",
        "ai_summary": "Vendor encroachment blocking stormwater drain channel.",
        "triaged_by": "simulated",
        "triage_latency_ms": 11,
        "offset_hours": 115,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000027"),
        "text": "Stray pack of rabid dogs chasing school children near morning bus stop.",
        "location": "Street 34, Sector G-13/2",
        "reporter_contact": "parents_council@example.com",
        "category": Category.OTHER.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Stray dogs posing danger to school children.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 310,
        "offset_hours": 120,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000028"),
        "text": "Illegal loud speakers on rooftop playing sound throughout the night violating municipal code.",
        "location": "Commercial Market, Satellite Town",
        "reporter_contact": "peace_resident@example.com",
        "category": Category.OTHER.value,
        "priority": Priority.LOW.value,
        "status": "rejected",
        "ai_summary": "Commercial noise violation late at night.",
        "triaged_by": "rules",
        "triage_latency_ms": 4,
        "offset_hours": 125,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000029"),
        "text": "Overhead water storage tank overflowing onto street due to stuck float valve.",
        "location": "Block 6, PECHS, Karachi",
        "reporter_contact": "pechs_sec@example.com",
        "category": Category.WATER.value,
        "priority": Priority.LOW.value,
        "status": "resolved",
        "ai_summary": "Overhead tank overflowing due to stuck valve.",
        "triaged_by": "simulated",
        "triage_latency_ms": 10,
        "offset_hours": 130,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000030"),
        "text": "Public park grass overgrown, benches broken, and jogging track full of mud.",
        "location": "Model Town C-Block Park",
        "reporter_contact": "model_town_c@example.com",
        "category": Category.OTHER.value,
        "priority": Priority.LOW.value,
        "status": "open",
        "ai_summary": "Public park maintenance and broken benches.",
        "triaged_by": "rules",
        "triage_latency_ms": 5,
        "offset_hours": 135,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000031"),
        "text": "Underground storm water drain choked with plastic bags causing localized flood.",
        "location": "Abpara Market Chowk, G-6",
        "reporter_contact": "abpara_traders@example.com",
        "category": Category.WATER.value,
        "priority": Priority.HIGH.value,
        "status": "open",
        "ai_summary": "Choked storm water drain causing market flooding.",
        "triaged_by": "llm:groq",
        "triage_latency_ms": 320,
        "offset_hours": 140,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-000000000032"),
        "text": "Road dividing barrier broken after accident, sharp iron sheets sticking into lane.",
        "location": "Murree Road near Shamsabad",
        "reporter_contact": "traffic_warden_12@example.com",
        "category": Category.ROADS.value,
        "priority": Priority.HIGH.value,
        "status": "in_progress",
        "ai_summary": "Damaged iron road divider hazardous to passing vehicles.",
        "triaged_by": "rules:fallback",
        "triage_latency_ms": 420,
        "offset_hours": 145,
    },
]


def seed_database(db: Optional[Session] = None) -> int:
    """
    Idempotently seeds >= 30 realistic Urdu-English municipal complaints.
    Running it multiple times updates existing records without creating duplicates.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    now = datetime.now(timezone.utc)
    seeded_count = 0

    try:
        for item in SEED_COMPLAINTS:
            hours_offset = int(str(item["offset_hours"]))
            created_at = now - timedelta(hours=hours_offset)
            updated_at = created_at + timedelta(minutes=15)
            complaint_id: uuid.UUID = (
                item["id"] if isinstance(item["id"], uuid.UUID) else uuid.UUID(str(item["id"]))
            )
            category_enum = Category(str(item["category"]))
            priority_enum = Priority(str(item["priority"]))
            status_enum = ComplaintStatus(str(item["status"]))
            contact_str: Optional[str] = (
                str(item["reporter_contact"]) if item.get("reporter_contact") else None
            )
            summary_str: Optional[str] = str(item["ai_summary"]) if item.get("ai_summary") else None

            existing = db.get(ComplaintModel, complaint_id)
            if existing is not None:
                existing.text = str(item["text"])
                existing.location = str(item["location"])
                existing.reporter_contact = contact_str
                existing.category = category_enum
                existing.priority = priority_enum
                existing.status = status_enum
                existing.ai_summary = summary_str
                existing.triaged_by = str(item["triaged_by"])
                existing.triage_latency_ms = int(str(item["triage_latency_ms"]))
                existing.created_at = created_at
                existing.updated_at = updated_at
            else:
                complaint = ComplaintModel(
                    id=complaint_id,
                    text=str(item["text"]),
                    location=str(item["location"]),
                    reporter_contact=contact_str,
                    category=category_enum,
                    priority=priority_enum,
                    status=status_enum,
                    ai_summary=summary_str,
                    triaged_by=str(item["triaged_by"]),
                    triage_latency_ms=int(str(item["triage_latency_ms"])),
                    created_at=created_at,
                    updated_at=updated_at,
                )
                db.add(complaint)
            seeded_count += 1

        db.commit()
        print(f"[+] Successfully seeded {seeded_count} complaints idempotently.")
        return seeded_count
    except Exception as e:
        db.rollback()
        print(f"[!] Seeding failed: {e}")
        raise e
    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_database()
