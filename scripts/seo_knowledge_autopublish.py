#!/usr/bin/env python3
"""Autonomous, opt-in editorial publishing for already-published Knowledge articles.

This is NOT a bulk generator: a pre-existing evidence-backed draft is required.
No public write occurs until real Chromium renders its identical React component
and passes responsive checks. Every publication is versioned and reversible.
"""
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path

from seo_editorial_autopublish import Backend
import seo_knowledge_qa as qa


def get_article(backend,content_id):
    rows=backend.request('GET','content_items',params={
        'tenant_id':'eq.sc-analytics','content_id':'eq.'+content_id,
        'channel':'eq.website','content_type':'eq.article','status':'eq.published',
        'select':'content_id,brief_id,language,status,published_at,title,body,critique',
        'limit':'1'})
    if len(rows)!=1:raise RuntimeError('Article missing or no longer published')
    article=rows[0]
    if not article['published_at'] or article['language'] not in ('en','es','ca'):
        raise RuntimeError('Ineligible publication status or locale')
    return article

def expected_article(before,patch):
    if not patch or set(patch)-{'title','body','article_meta'}:
        raise RuntimeError('Unexpected or empty editorial patch')
    existing=before.get('critique') or {}
    meta=existing.get('article_meta') or {}
    updated=dict(before)
    if 'title' in patch:updated['title']=patch['title']
    if 'body' in patch:updated['body']=patch['body']
    if 'article_meta' in patch:
        if not isinstance(patch['article_meta'],dict):raise RuntimeError('Invalid article_meta')
        updated['critique']={**existing,'article_meta':{**meta,**patch['article_meta']}}
    return updated

def run():
    backend=Backend()
    recovery=backend.rpc('recover_stale_seo_knowledge_drafts')
    if recovery.get('needs_manual_review',0):
        raise RuntimeError('CRITICAL: unresolved Knowledge rollback; stop further changes')
    draft=backend.rpc('claim_seo_knowledge_draft')
    if not draft:
        print('NO_OP: no approved Knowledge draft awaiting QA')
        return 0
    draft_id=draft['draft_id']
    published=False
    try:
        content_id=draft['content_id']
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,180}',content_id):
            raise RuntimeError('Bad content_id')
        before=get_article(backend,content_id)
        oldhash=backend.rpc('seo_knowledge_hash',p_content_id=content_id)
        if oldhash!=draft['baseline_hash']:
            raise RuntimeError('Content changed since draft created')
        future=expected_article(before,draft['patch'])
        slug=before['brief_id'];language=before['language']
        qa.article_url(slug,language)
        with tempfile.TemporaryDirectory(prefix='seo-knowledge-qa-') as tmp:
            folder=Path(tmp)
            results=qa.gate(slug,language,content_id,draft_id,backend.key,future,folder)
            reference=hashlib.sha256(json.dumps(
                {'draft_id':draft_id,'baseline_hash':oldhash,
                 'patch':draft['patch'],'qa':results},sort_keys=True,ensure_ascii=False).encode()).hexdigest()
            published_result=backend.rpc('publish_seo_knowledge_draft',
                p_draft_id=draft_id,p_qa_reference=reference)
            published=True
            actual=get_article(backend,content_id)
            if actual['title']!=future['title'] or actual['body']!=future['body'] or actual['critique']!=future['critique']:
                raise RuntimeError('Database did not publish exactly the approved content')
            qa.verify_published(slug,language,future,folder)
            ok=backend.rpc('complete_seo_knowledge_draft',
                p_draft_id=draft_id,p_qa_reference=reference)
            if ok is not True:raise RuntimeError('Unable to confirm checked publication')
            print(json.dumps({'state':'PUBLISHED','draft_id':draft_id,
                'content_id':content_id,'path':'/knowledge/'+slug+'/'+language,
                'new_hash':published_result['new_hash']},ensure_ascii=False))
            return 0
    except Exception as error:
        reason=(type(error).__name__+': '+str(error))[:480]
        try:
            if published:
                restored=backend.rpc('rollback_seo_knowledge_draft',
                    p_draft_id=draft_id,p_reason=reason)
                print(json.dumps({'state':'ROLLED_BACK','draft_id':draft_id,
                    'restored_hash':restored,'reason':reason},ensure_ascii=False))
            else:
                backend.rpc('fail_seo_knowledge_draft',p_draft_id=draft_id,p_reason=reason)
                print(json.dumps({'state':'BLOCKED','draft_id':draft_id,'reason':reason},ensure_ascii=False))
        except Exception as rollback_error:
            print('CRITICAL: Knowledge rollback failed for '+draft_id+' ('+type(rollback_error).__name__+')',file=sys.stderr)
        return 1

if __name__=='__main__':
    sys.exit(run())
