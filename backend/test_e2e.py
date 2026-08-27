import urllib.request, json

# Login as admin
data = json.dumps({'email': 'nayandg8@gmail.com', 'password': 'admin@123'}).encode()
req = urllib.request.Request('http://127.0.0.1:5000/api/auth/login', data=data, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as f:
    r = json.loads(f.read())
    token = r['accessToken']
    print('Login OK, role=' + r['user']['role'])

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request('http://127.0.0.1:5000/api' + path, data=data,
        headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as f:
        return json.loads(f.read())

# 1. Skills — no body needed, uses logged-in user
print('\n[1] Skill Analysis...')
try:
    result = post('/ai/skills/analyze', {})
    profile = result.get('profile', {})
    cats = profile.get('categories', [])
    mastery = profile.get('masteryItems', [])
    gaps = profile.get('gapAnalysis', [])
    print('  OK: categories=' + str(len(cats)) + ', masteryItems=' + str(len(mastery)) + ', gaps=' + str(len(gaps)))
    if cats:
        print('  Sample category: ' + str(cats[0]))
except Exception as e:
    print('  FAIL: ' + str(e)[:200])

# 2. Roadmap — requires targetRoles
print('\n[2] Roadmap Generation...')
try:
    result = post('/ai/roadmap', {'targetRoles': ['Senior Backend Engineer', 'DevOps & Pipeline Infrastructure']})
    milestones = result.get('milestones', [])
    readiness = result.get('readiness', 0)
    print('  OK: milestones=' + str(len(milestones)) + ', readiness=' + str(readiness) + '%')
    if milestones:
        print('  Sample milestone: ' + str(milestones[0].get('title', '?')))
except Exception as e:
    print('  FAIL: ' + str(e)[:200])

# 3. Companies — no extra body needed
print('\n[3] Company Matching...')
try:
    result = post('/ai/companies', {})
    matches = result.get('matches', [])
    print('  OK: matches=' + str(len(matches)))
    if matches:
        print('  Sample: ' + str(matches[0].get('name', '?')) + ' score=' + str(matches[0].get('matchScore', '?')))
except Exception as e:
    print('  FAIL: ' + str(e)[:200])

print('\nDone.')
