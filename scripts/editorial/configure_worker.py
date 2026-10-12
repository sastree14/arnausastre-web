"""Configure the server-held publishing key without exposing it to logs or clients."""
import json
import os
from urllib.request import Request, urlopen


def main():
    names = ('SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'GROWTH_ENCRYPTION_KEY')
    missing = [name for name in names if not os.environ.get(name, '').strip()]
    if missing:
        raise SystemExit('Missing CI configuration: ' + ', '.join(missing))
    service_key = os.environ['SUPABASE_SECRET_KEY'].strip()
    headers = {'apikey': service_key, 'Content-Type': 'application/json'}
    if service_key.startswith('eyJ'):
        headers['Authorization'] = 'Bearer ' + service_key
    data = json.dumps({'p_encryption_key': os.environ['GROWTH_ENCRYPTION_KEY'].strip(),
                       'p_organization_id': os.environ.get('LINKEDIN_ORGANIZATION_ID', '').strip()}).encode()
    request = Request(os.environ['SUPABASE_URL'].rstrip('/') + '/rest/v1/rpc/editorial_configure_worker',
                      data=data, headers=headers, method='POST')
    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
    except Exception:
        raise SystemExit('Editorial worker configuration failed; check CI secrets and migration deployment')
    print(json.dumps({'key_configured': bool(result.get('key_configured')),
                      'organization_configured': bool(result.get('organization_configured'))}))


if __name__ == '__main__':
    main()
