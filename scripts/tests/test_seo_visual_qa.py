"""Browser smoke-test of the visual QA core, without accessing production."""
import importlib.util
import os
from pathlib import Path
import unittest
from playwright.sync_api import sync_playwright

MODULE=Path(__file__).resolve().parents[1]/'seo_visual_qa.py'
spec=importlib.util.spec_from_file_location('seo_visual_qa',MODULE)
qa=importlib.util.module_from_spec(spec)
spec.loader.exec_module(qa)

HTML="""<!doctype html><html><head><title>Service</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:Arial,sans-serif}
main>section{padding:24px}main>section:first-of-type,main>section:last-of-type{background:#0D1B2A;color:white}
article{border:1px solid #CBD5E1;padding:20px;display:grid;grid-template-columns:40% 60%}
article.bg-white{background:white}
article.bg-\\[\\#EAF0F6\\]{background:#EAF0F6}
article h2,article p{margin:0;padding:0 10px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.grid>a{display:block;padding:16px;border:1px solid #CBD5E1}
@media(max-width:700px){article{grid-template-columns:1fr}.grid{grid-template-columns:1fr}}
</style></head><body><main>
<section><nav><span aria-current="page">Service</span></nav><h1>Service</h1><p class="whitespace-pre-wrap">Introduction</p></section>
<section><div><article class="bg-white"><h2>Area one</h2><p>Explanation one</p></article><article class="bg-[#EAF0F6]"><h2>Area two</h2><p>Explanation two</p></article></div></section>
<section><div class="grid"><a href="#a">Related</a><a href="#b">Case</a><a href="#c">Contact</a></div></section>
<section><div><h2>Contact us</h2><p>Original contact description</p></div></section>
</main></body></html>"""

class VisualGateTests(unittest.TestCase):
 def test_no_unauthorized_draft_fields(self):
  with self.assertRaises(ValueError):
   qa.validate('https://www.sc-analytics.io/services/inventory-optimization',{'css':'change'},False)
 def test_reject_nonservice_route(self):
  with self.assertRaises(ValueError):
   qa.validate('https://www.sc-analytics.io/knowledge/article',{'h1':'Hello'},False)
 def test_browser_layout_after_appending_section(self):
  executable=os.environ.get('SEO_VISUAL_BROWSER_EXECUTABLE')
  if not executable and Path('/usr/bin/chromium').exists(): executable='/usr/bin/chromium'
  kwargs={'executable_path':executable} if executable else {}
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True,**kwargs)
   try:
    for width,height in qa.SIZES.values():
     page=browser.new_page(viewport={'width':width,'height':height})
     try:
      page.set_content(HTML,wait_until='domcontentloaded')
      before=page.evaluate(qa.MEASURE,{'elements':qa.ELEMENTS,'keys':qa.KEYS})
      self.assertNotIn('fatal',before)
      self.assertFalse(before['issues'])
      draft={'h1':'New useful service headline',
        'intro':'A longer description that explains the business value and the method.',
        'sections':[{'heading':'Area one','body':'Description of the first existing application.'},
                    {'heading':'Area two','body':'Description of a different existing application.'},
                    {'heading':'New section','body':'New, coherent business application explained in more detail.'}]}
      page.evaluate(qa.INJECT,draft)
      after=page.evaluate(qa.MEASURE,{'elements':qa.ELEMENTS,'keys':qa.KEYS})
      self.assertNotIn('fatal',after)
      self.assertFalse(after['issues'],after['issues'])
      self.assertEqual(before['styles'],after['styles'])
      self.assertEqual(after['sectionCount'],3)
     finally:page.close()
   finally:browser.close()

if __name__=='__main__': unittest.main()
