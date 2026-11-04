"""Unit checks for the publisher's safety logic. No database writes or network access."""
import importlib.util
from pathlib import Path
import tempfile
import unittest
from PIL import Image

root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('seo_editorial_autopublish',root/'seo_editorial_autopublish.py')
import sys
sys.path.insert(0,str(root))
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

class EditorialPublisherTests(unittest.TestCase):
 def test_rejects_visual_styles_in_patch(self):
  with self.assertRaises(RuntimeError):
   module.expected_record({'h1':'Original'},{'css':'color:red'})
 def test_preserves_original_fields_outside_patch(self):
  row={'title':'Existing SEO title','h1':'Existing heading',
       'sections':[{'heading':'Sample','body':'Enough detail'}],
       'cta_body':'Existing CTA','cta_title':'Contact us'}
  expected=module.expected_record(row,{'h1':'New heading'})
  self.assertEqual(expected['title'],row['title'])
  self.assertEqual(expected['h1'],'New heading')
  self.assertEqual(expected['sections'],row['sections'])
 def test_same_screenshot_passes(self):
  with tempfile.TemporaryDirectory() as d:
   a=Path(d)/'a.png';b=Path(d)/'b.png'
   Image.new('RGB',(375,812),(255,255,255)).save(a)
   Image.new('RGB',(375,812),(255,255,255)).save(b)
   module.compare_images(a,b)
 def test_large_visual_change_fails(self):
  with tempfile.TemporaryDirectory() as d:
   a=Path(d)/'a.png';b=Path(d)/'b.png'
   Image.new('RGB',(375,812),(255,255,255)).save(a)
   Image.new('RGB',(375,812),(0,0,0)).save(b)
   with self.assertRaises(RuntimeError):module.compare_images(a,b)

if __name__=='__main__':unittest.main()
