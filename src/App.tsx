import { useState, type FormEvent } from 'react';
import { HashRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';

const navigationItems = [
  { label: 'About', path: '/' },
  { label: 'Apps', path: '/apps' },
  { label: 'Restaurant Week', path: '/restaurantweek' },
  { label: 'Contact', path: '/contact' },
];

function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        KD Designs
      </Link>
      <nav className="site-nav" aria-label="Main navigation">
        {navigationItems.map((item) => (
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            end={item.path === '/'}
            key={item.path}
            to={item.path}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setIsSubmitted(true);
  }

  return (
    <section className="contact-page" id="contact">
      <div className="contact-content">
        <div className="contact-copy">
          <h1>
            Let’s build
            <br />
            something that
            <br />
            <span>matters.</span>
          </h1>
          <p>
            I&apos;d love to hear from, partner with, and support non-profits and mission driven efforts,
            especially in healthcare, education, and immigrants&apos; rights spaces.
          </p>
        </div>

        <div className="contact-card">
          {isSubmitted ? (
            <div className="contact-success" role="status">
              <h2>Message sent.</h2>
              <p>Thanks for reaching out. I’ll be in touch soon.</p>
              <button className="contact-reset" onClick={() => setIsSubmitted(false)} type="button">
                Send another message
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" required type="text" />

              <label htmlFor="email">Email</label>
              <input id="email" name="email" required type="email" />

              <label htmlFor="organization">Organization</label>
              <input id="organization" name="organization" type="text" />

              <label htmlFor="mission">Tell me about your mission</label>
              <textarea id="mission" name="mission" required rows={4} />

              <button className="contact-submit" type="submit">
                Send message
              </button>

              <p className="contact-email">
                Prefer email? <a href="mailto:madebykddesigns@gmail.com">madebykddesigns@gmail.com</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="hero" id="top">
      <div className="portrait-frame">
        <img src={`${import.meta.env.BASE_URL}Profile_Pic.jpg`} alt="Katie smiling in front of the Chicago skyline" />
      </div>
      <h1>Hi, I’m Katie <span>:)</span></h1>
      <p className="role">Jelly-bean-powered indie app developer</p>
      <p className="intro">
        I build small, useful apps from my spare bedroom, solo with love (and too many jelly beans)
      </p>

      <div className="details-card">
        <div className="detail-item stacked-detail">
          <MapPin className="detail-icon location-icon" size={23} strokeWidth={1.8} />
          <strong>Chicago</strong>
        </div>
        <div className="detail-item stacked-detail">
          <div className="stat-number">3</div>
          <strong>Apps shipped</strong>
        </div>
        <Link className="detail-item email-detail" to="/contact">
          <Mail className="detail-icon email-icon" size={23} strokeWidth={1.8} />
          <strong>Say hi →</strong>
        </Link>
      </div>

      <Link className="primary-action" to="/apps">
        See my apps
      </Link>
    </section>
  );
}

type AppCardData = {
  name: string;
  description: string;
  votes: number;
  preview: 'recipes' | 'focus' | 'draw' | 'habits';
};

const appCards: AppCardData[] = [
  { description: 'recipes that fit in your pocket', name: 'Pocket Recipes', preview: 'recipes', votes: 342 },
  { description: 'a gentle pomodoro timer', name: 'FocusFlow', preview: 'focus', votes: 128 },
  { description: 'draw-and-guess with friends', name: 'DrawDuel', preview: 'draw', votes: 89 },
  { description: 'dead-simple habit tracking', name: 'Tally Habits', preview: 'habits', votes: 601 },
];

function AppPreview({ type }: { type: AppCardData['preview'] }) {
  return (
    <div className={`app-preview app-preview-${type}`} aria-hidden="true">
      {type === 'recipes' && (
        <>
          <div className="preview-status">9:41</div>
          <div className="preview-title">Pocket Recipes <span>⌕</span></div>
          <div className="preview-tabs"><b>All</b><span>Breakfast</span><span>Lunch</span></div>
          <div className="recipe-dish"><i /><i /><i /></div>
          <div className="preview-lines"><b>Lemon Garlic Pasta</b><span>20 min · 4 ingredients</span></div>
        </>
      )}
      {type === 'focus' && (
        <>
          <div className="preview-status">9:41</div>
          <div className="preview-title">FocusFlow</div>
          <div className="focus-ring"><strong>25:00</strong><span>Focus time</span></div>
          <div className="focus-button">▶ Start</div>
          <div className="focus-tabs"><span>Pomodoro</span><span>Short Break</span></div>
        </>
      )}
      {type === 'draw' && (
        <>
          <div className="preview-status">9:41</div>
          <div className="preview-title">DrawDuel <span>♧</span></div>
          <div className="draw-canvas"><b>⌣</b><i /><span /></div>
          <div className="draw-colors"><i /><i /><i /><i /><i /><i /></div>
        </>
      )}
      {type === 'habits' && (
        <>
          <div className="preview-status">9:41</div>
          <div className="preview-title">Tally Habits <span>＋</span></div>
          <div className="habit-row"><span>Work out</span><i>✓</i><i>✓</i><i>✓</i></div>
          <div className="habit-row"><span>Read</span><i>✓</i><i>✓</i><i>✓</i></div>
          <div className="habit-row"><span>Drink water</span><i>✓</i><i>✓</i><i>✓</i></div>
          <div className="habit-row"><span>Be kind</span><i>✓</i><i>✓</i><i>✓</i></div>
        </>
      )}
    </div>
  );
}

function AppCard({ app }: { app: AppCardData }) {
  return (
    <article className="app-card">
      <AppPreview type={app.preview} />
      <div className="app-card-body">
        <h2>{app.name}</h2>
        <p>{app.description}</p>
        <button className="store-button" type="button"><span aria-hidden="true">▶</span> Get it on Google Play</button>
        <button className="vote-button" type="button">Vote for iOS · <strong>{app.votes}</strong></button>
      </div>
    </article>
  );
}

function AppsPage() {
  return (
    <section className="apps-page">
      <div className="apps-heading">
        <h1>My Apps</h1>
        <p>Everything I&apos;ve shipped so far — and what to vote for next on iOS</p>
      </div>
      <div className="apps-grid">
        {appCards.map((app) => <AppCard app={app} key={app.name} />)}
      </div>
      <div className="apps-support">
        <h2>Enjoying my apps?</h2>
        <p>Support me by downloading my apps, providing feedback via the surveys linked above, or Support me on Venmo @Made-by-KD-Designs</p>
      </div>
    </section>
  );
}

function SimplePage({ title, description }: { title: string; description: string }) {
  return (
    <section className="simple-page">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function App() {
  return (
    <HashRouter>
      <main className="site-shell">
        <SiteHeader />
        <Routes>
          <Route element={<AboutPage />} path="/" />
          <Route element={<AppsPage />} path="/apps" />
          <Route
            element={
              <SimplePage
                description="A thoughtful guide to Chicago’s Restaurant Week."
                title="Restaurant Week"
              />
            }
            path="/restaurantweek"
          />
          <Route element={<ContactPage />} path="/contact" />
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;
