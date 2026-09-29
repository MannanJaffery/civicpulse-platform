from app.models import ComplaintModel
from app.seed import SEED_COMPLAINTS, seed_database


def test_seed_database_idempotent(db_session):
    # First seed run
    count1 = seed_database(db_session)
    assert count1 == len(SEED_COMPLAINTS)
    total1 = db_session.query(ComplaintModel).count()
    assert total1 == len(SEED_COMPLAINTS)

    # Second seed run (must not duplicate records)
    count2 = seed_database(db_session)
    assert count2 == len(SEED_COMPLAINTS)
    total2 = db_session.query(ComplaintModel).count()
    assert total2 == len(SEED_COMPLAINTS)
