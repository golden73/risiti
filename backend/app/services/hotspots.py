from collections import Counter

from sqlmodel import Session, select

from ..models import Area, Report
from ..schemas import Hotspot


def get_hotspots(session: Session) -> list[Hotspot]:
    reports = session.exec(select(Report)).all()
    counts = Counter(report.area for report in reports)
    areas = {area.name: area for area in session.exec(select(Area)).all()}

    results: list[Hotspot] = []
    for name, count in counts.items():
        area = areas.get(name)
        results.append(
            Hotspot(
                area=name,
                report_count=count,
                lat=area.lat if area else None,
                lng=area.lng if area else None,
            )
        )
    results.sort(key=lambda item: (-item.report_count, item.area))
    return results
