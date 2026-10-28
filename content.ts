// All visible text, links and projects for the site live here.
// Components import from this file — never hard-code words in a component.
//
// Sections match the lily: the centre (Core) is "about", the four petals are
// experiences / leadership / education / hobbies, and the last two petals are
// "in the making". Projects sit inside Experiences. Fill these from content/me.md.

export type Entry = {
  title: string; // "Role — Company", "Degree — University", "Project: Title", ...
  dates?: string;
  location?: string;
  oneLiner?: string;
  details?: string[];
  tools?: string[];
  images?: string[]; // paths inside public/images, e.g. "/images/company-1.jpg"
  link?: string;
};

export type Section = {
  title: string;
  short: string; // shown in the side panel when a petal is clicked
  long: string; // shown at the top of the full section page
  items: Entry[];
};

export type ContactLink = {
  label: string;
  href: string;
};

export const content = {
  site: {
    title: "Orange Lily — Portfolio",
    description: "Personal portfolio. Placeholder description.",
  },

  // Home page text under the lily.
  about: {
    title: "About",
    name: "Your Name",
    tagline: "Placeholder tagline.",
    text: "Placeholder about text. Write a few sentences about who you are, what you make, and what you care about.",
  },

  // One entry per clickable part of the lily. The key is also the page URL (/experiences).
  sections: {
    about: {
      title: "About me",
      short: "Placeholder: 2–3 sentences on who you are.",
      long: "Placeholder: a few paragraphs — your story and what the name / orange lily means.",
      items: [],
    },
    experiences: {
      title: "Experiences",
      short: "Placeholder: one line summing up your experiences and projects.",
      long: "Placeholder: a longer intro to your work and projects.",
      items: [],
    },
    leadership: {
      title: "Leadership & extracurriculars",
      short: "Placeholder: one line about societies, clubs and leadership roles.",
      long: "Placeholder: a longer intro to your leadership and extracurriculars.",
      items: [],
    },
    education: {
      title: "Education",
      short: "Placeholder: one line about your studies.",
      long: "Placeholder: a longer intro to your education.",
      items: [],
    },
    hobbies: {
      title: "Interests",
      short: "Placeholder: one line about life outside work.",
      long: "Placeholder: a longer intro to your interests.",
      items: [],
    },
  } satisfies Record<string, Section>,

  // The two petals that aren't sections yet.
  inTheMaking: {
    label: "In the making",
    note: "Still growing — coming soon",
  },

  // Small interface words used around the lily.
  lily: {
    discover: "Discover",
    open: "Read more",
    explore: "Explore",
    arrow: "→",
    close: "Close",
    back: "← Back to the lily",
  },

  contact: {
    title: "Contact",
    text: "Placeholder invitation to get in touch.",
    email: "hello@example.com",
    cv: "/cv.pdf",
    links: [
      { label: "GitHub", href: "https://github.com/your-username" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/your-username" },
    ] satisfies ContactLink[],
  },
} as const;

export type SectionId = keyof typeof content.sections;

export function isSectionId(value: string): value is SectionId {
  return value in content.sections;
}
