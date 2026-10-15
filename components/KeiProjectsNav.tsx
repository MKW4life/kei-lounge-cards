/**
 * Navigation shared by the Lounge Card editor and Item Counter.
 * The portal and MKW Course Stats URLs have both been verified as live.
 * Keep optional public environment variables for URL overrides.
 */
const projectsUrl = process.env.NEXT_PUBLIC_KEI_PROJECTS_URL?.trim() || "https://kei-projects-33b53.web.app/";
const courseStatsUrl = process.env.NEXT_PUBLIC_MKW_COURSE_STATS_URL?.trim() || "https://mkw-trackstats.pages.dev/";

export default function KeiProjectsNav() {
  return (
    <nav className="project-nav" aria-label="Kei Projects">
      <details>
        <summary>Kei Projects</summary>
        <div className="project-nav-menu">
          {projectsUrl && <a href={projectsUrl}>Kei Projects ホーム</a>}
          <a href="/">Kei Lounge Card</a>
          <a href="/item-counter">MKW Item Counter</a>
          <a href="https://kei-brstm-hub.vercel.app/" target="_blank" rel="noopener noreferrer">
            Kei BRSTM Hub
          </a>
          {courseStatsUrl && (
            <a href={courseStatsUrl} target="_blank" rel="noopener noreferrer">
              MKW Course Stats
            </a>
          )}
        </div>
      </details>
    </nav>
  );
}
