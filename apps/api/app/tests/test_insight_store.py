from app.schemas.stream import InsightEnvelope
from app.services.insight_store import InsightStore


def _insight(match_id: str, minute: int, mode: str = "analyst") -> InsightEnvelope:
    return InsightEnvelope(
        insight_id=f"{match_id}-{minute}-{mode}",
        match_id=match_id,
        minute=minute,
        second=0,
        category="key_moment",
        title="t",
        body="b",
        viewer_mode=mode,
    )


def test_store_filters_by_mode_and_minute():
    store = InsightStore()
    store.add(_insight("m1", 10, "analyst"))
    store.add(_insight("m1", 20, "casual"))
    store.add(_insight("m1", 30, "analyst"))
    store.add(_insight("m2", 5))

    assert len(store.list("m1")) == 3
    assert len(store.list("m1", viewer_mode="analyst")) == 2
    assert len(store.list("m1", since_minute=20)) == 2
    assert len(store.list("m1", viewer_mode="analyst", since_minute=25)) == 1
    assert len(store.list("m2")) == 1
    assert len(store.list("m3")) == 0


def test_store_ring_buffer_evicts_oldest():
    store = InsightStore(max_per_match=3)
    for m in range(10, 60, 10):
        store.add(_insight("m1", m))
    items = store.list("m1")
    assert len(items) == 3
    assert [i.minute for i in items] == [30, 40, 50]
