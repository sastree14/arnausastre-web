import importlib.util
import json
import unittest
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from growth.src.publishing import _commentary_for_mode, PublishingError

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('calendar_builder',ROOT/'scripts/editorial/build_calendar.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class EditorialCalendarTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.posts=json.loads((ROOT/'growth/data/editorial-approved-manifest.json').read_text())
        cls.calendar=builder.build(cls.posts)

    def test_every_approved_publication_appears_once(self):
        self.assertEqual(len(self.posts),150)
        self.assertEqual(len(self.calendar),150)
        self.assertEqual({p['content_id'] for p in self.posts},{p['content_id'] for p in self.calendar})
        self.assertEqual(len({p['content_id'] for p in self.calendar}),150)

    def test_test_carousel_cannot_be_published_by_the_calendar(self):
        reserved=[p for p in self.calendar if p['test_reserved']]
        self.assertEqual(len(reserved),1)
        self.assertEqual(reserved[0]['images'],6)
        self.assertIsNone(reserved[0]['scheduled_at'])

    def test_start_cadence_dst_and_no_double_slots(self):
        dates=[datetime.fromisoformat(p['scheduled_at']) for p in self.calendar if p['scheduled_at']]
        self.assertEqual(dates[0].isoformat(),'2026-10-14T16:00:00+02:00')
        self.assertEqual(len(set(dates)),149)
        self.assertEqual(dates,sorted(dates))
        for date in dates:
            local=date.astimezone(ZoneInfo('Europe/Madrid'))
            self.assertIn(local.weekday(),{0,2,4})
            self.assertEqual(local.hour,15 if local.weekday()==4 else 16)
        self.assertEqual(datetime.fromisoformat(next(p['scheduled_at'] for p in self.calendar if p['scheduled_at'] and p['scheduled_at'].startswith('2026-10-26'))).utcoffset().total_seconds(),3600)

    def test_collection_contains_all_325_original_slides(self):
        self.assertEqual(sum(len(p['slides']) for p in self.posts),325)
        for p in self.posts:
            self.assertIn(len(p['slides']),{1,6})
            self.assertEqual([s['x'] for s in p['slides']],sorted(s['x'] for s in p['slides']))
            self.assertTrue(all(s['w']==1080 and s['h']==1350 for s in p['slides']))

    def test_approved_copy_and_hashtags_are_preserved_exactly(self):
        for p in self.posts:
            item={'body':p['body'],'hashtags':['#DoNotAppend'],'publication_mode':'visual_first','visual_strategy':{'publisher':'editorial_edge'}}
            self.assertEqual(_commentary_for_mode(item),p['body'])

    def test_long_approved_copy_is_rejected_instead_of_truncated(self):
        with self.assertRaises(PublishingError):
            _commentary_for_mode({'body':'a'*3001,'visual_strategy':{'publisher':'editorial_edge'}})


if __name__=='__main__':
    unittest.main()
