"""Knowledge editorial safety checks. All tests are read-only and use no secrets."""
import sys
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))
import seo_knowledge_qa as qa
import seo_knowledge_autopublish as publisher

class KnowledgeEditorialTests(unittest.TestCase):
    def test_authentication_token_is_bounded(self):
        token=qa.signed_preview('knowledge_kb_011_en','f2847ccd-4fe2-46cf-b988-39c20542053a','dummy-key',expires=1793818000)
        expires,digest=token.split(':')
        self.assertEqual(expires,'1793818000')
        self.assertEqual(len(digest),64)
        self.assertEqual(token,qa.signed_preview('knowledge_kb_011_en','f2847ccd-4fe2-46cf-b988-39c20542053a','dummy-key',expires=1793818000))
        self.assertNotEqual(token,qa.signed_preview('other_id','f2847ccd-4fe2-46cf-b988-39c20542053a','dummy-key',expires=1793818000))

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
