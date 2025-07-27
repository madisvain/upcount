export interface Asset {
  name: string;
  browser_download_url: string;
}

export interface ReleaseData {
  tag_name: string;
  name: string;
  assets: Asset[];
}

let cachedReleaseData: ReleaseData | null = null;

export async function getLatestRelease(): Promise<ReleaseData | null> {
  // Return cached data if available
  if (cachedReleaseData) {
    return cachedReleaseData;
  }

  try {
    const response = await fetch('https://api.github.com/repos/madisvain/upcount/releases/latest');
    if (response.ok) {
      cachedReleaseData = await response.json() as ReleaseData;
      return cachedReleaseData;
    }
  } catch (error) {
    console.warn('Failed to fetch latest release:', error);
  }
  
  return null;
}

export async function getLatestVersion(): Promise<string> {
  const release = await getLatestRelease();
  if (!release?.tag_name) {
    throw new Error('Failed to fetch latest version from GitHub releases');
  }
  // Return the tag name which should be the version (e.g., "v2.0.0-beta.12")
  return release.tag_name;
}