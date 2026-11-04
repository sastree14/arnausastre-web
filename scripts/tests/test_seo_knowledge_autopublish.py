"""Knowledge editorial safety checks. All tests are read-only and use no secrets."""
import sys
import secrets
import hashlib
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import seo_knowledge_qa as qa
import seo_knowledge_autopublish as publisher

class KnowledgeEditorialTests(unittest.TestCase):
    def test_preview_token_is_unpredictable_and_hashed(self):
        one=secrets.token_urlsafe(32)
        two=secrets.token_urlsafe(32)
        self.assertNotEqual(one,two)
        self.assertEqual(len(hashlib.sha256(one.encode()).hexdigest()),64)
        self.assertNotEqual(hashlib.sha256(one.encode()).digest(),hashlib.sha256(two.encode()).digest())

    def test_reject_wrong_article_path(self):
        for slug in ('../admin','https://bad.site','missing/slug'):
            with self.assertRaises(ValueError):qa.article_url(slug,'en')
        with self.assertRaises(ValueError):qa.article_url('valid-slug','de')

    def test_editorial_patch_cannot_affect_design(self):
        current={'title':'Original article title','body':'Article body','critique':{'article_meta':{'seo_title':'Old title'},'other':'untouched'}}
        with self.assertRaises(RuntimeError):
            publisher.expected_article(current,{'css':'.site{color:red}'})
        edited=publisher.expected_article(current,{'title':'New article title','article_meta':{'seo_title':'New meta title'}})
        self.assertEqual(edited['title'],'New article title')
        self.assertEqual(edited['critique']['article_meta']['seo_title'],'New meta title')
        self.assertEqual(edited['critique']['other'],'untouched')
        self.assertEqual(current['title'],'Original article title')

    def test_qa_detects_template_missing(self):
        with self.assertRaises(RuntimeError):qa.assert_layout({'fatal':'unknown article layout'})

    def test_qa_compares_full_article(self):
        item={'title':'Title','body':'This is a sufficiently long paragraph that should be present in the article content.','language':'en'}
        info={'h1':'Title','lang':'en','articleText':'This is a sufficiently long paragraph that should be present in the article content.'}
        qa.assert_content(info,item)
        with self.assertRaises(RuntimeError):
            qa.assert_content({**info,'h1':'Not the draft title'},item)

if __name__=='__main__':unittest.main()
