const BIBLE_VERSIONS = {
  NIV: { id: 'de4e12af7f28f599-02', name: 'New International Version' },
  ESV: { id: '01b29f4b342acc35-01', name: 'English Standard Version' },
  KJV: { id: 'de4e12af7f28f599-01', name: 'King James Version' },
  NLT: { id: '65eec8e0b60e656b-01', name: 'New Living Translation' },
  NKJV: { id: 'c315fa9f71d4af3a-01', name: 'New King James Version' },
};

export type BibleVersion = keyof typeof BIBLE_VERSIONS;

interface ScriptureReference {
  reference: string;
  text: string;
  version: BibleVersion;
}

export async function getScripture(
  reference: string,
  version: BibleVersion = 'NIV'
): Promise<ScriptureReference | null> {
  const apiKey = process.env.API_BIBLE_KEY;

  if (!apiKey) {
    console.warn('API_BIBLE_KEY not configured');
    return null;
  }

  try {
    const bibleId = BIBLE_VERSIONS[version].id;

    // Parse the reference to get book, chapter, verses
    const passageId = encodeURIComponent(reference.replace(/\s+/g, ''));

    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/passages/${passageId}?content-type=text`,
      {
        headers: {
          'api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      console.error('Scripture API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      reference: data.data.reference,
      text: data.data.content.trim(),
      version,
    };
  } catch (error) {
    console.error('Error fetching scripture:', error);
    return null;
  }
}

export async function searchScripture(
  query: string,
  version: BibleVersion = 'NIV'
): Promise<ScriptureReference[]> {
  const apiKey = process.env.API_BIBLE_KEY;

  if (!apiKey) {
    console.warn('API_BIBLE_KEY not configured');
    return [];
  }

  try {
    const bibleId = BIBLE_VERSIONS[version].id;

    const response = await fetch(
      `https://api.scripture.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=10`,
      {
        headers: {
          'api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.data.passages.map((passage: { reference: string; content: string }) => ({
      reference: passage.reference,
      text: passage.content.trim(),
      version,
    }));
  } catch (error) {
    console.error('Error searching scripture:', error);
    return [];
  }
}

export { BIBLE_VERSIONS };
