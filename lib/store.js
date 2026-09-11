// GitHub 저장소의 data/notes.json 파일에 메모를 저장/조회한다. (외부 DB 불필요)
const OWNER = process.env.GH_OWNER;
const REPO = process.env.GH_REPO;
const BRANCH = process.env.GH_BRANCH || 'main';
const PATH = process.env.GH_PATH || 'data/notes.json';
const TOKEN = process.env.GH_TOKEN;

const api = (url, init = {}) =>
  fetch(`https://api.github.com${url}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

function assertEnv() {
  if (!OWNER || !REPO || !TOKEN) throw new Error('GH_OWNER / GH_REPO / GH_TOKEN 미설정');
}

export async function readNotes() {
  assertEnv();
  const res = await api(
    `/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}&t=${Date.now()}`
  );
  if (res.status === 404) return { notes: [], sha: null };
  if (!res.ok) throw new Error(`GitHub 읽기 실패: ${res.status} ${await res.text()}`);
  const json = await res.json();
  const text = Buffer.from(json.content, 'base64').toString('utf8');
  let notes = [];
  try {
    notes = JSON.parse(text);
  } catch {
    notes = [];
  }
  return { notes: Array.isArray(notes) ? notes : [], sha: json.sha };
}

export async function writeNotes(notes) {
  assertEnv();
  const { sha } = await readNotes();
  const res = await api(`/repos/${OWNER}/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `memo: update ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(notes, null, 2), 'utf8').toString('base64'),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GitHub 쓰기 실패: ${res.status} ${await res.text()}`);
  return true;
}
