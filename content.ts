// All visible text, links and projects for the site live here.
// Components import from this file — never hard-code words in a component.

export type Experience = {
  role: string;
  company: string;
  period: string;
  description: string;
};

export type Project = {
  title: string;
  description: string;
  image?: string; // path inside public/images, e.g. "/images/project-one.jpg"
  link?: string;
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

  about: {
    title: "About",
    name: "Your Name",
    tagline: "Designer & developer — placeholder tagline.",
    text: "Placeholder about text. Write a few sentences about who you are, what you make, and what you care about.",
  },

  experiences: {
    title: "Experiences",
    items: [
      {
        role: "Role title",
        company: "Company name",
        period: "2024 — Present",
        description: "Placeholder description of what you did here.",
      },
      {
        role: "Previous role",
        company: "Another company",
        period: "2022 — 2024",
        description: "Placeholder description of what you did here.",
      },
    ] satisfies Experience[],
  },

  projects: {
    title: "Projects",
    items: [
      {
        title: "Project one",
        description: "Placeholder project description.",
        image: "/images/project-one.jpg",
        link: "https://example.com",
      },
      {
        title: "Project two",
        description: "Placeholder project description.",
      },
    ] satisfies Project[],
  },

  theRealMe: {
    title: "The Real Me",
    text: "Placeholder text about life outside work — hobbies, interests, the things that make you you.",
  },

  contact: {
    title: "Contact",
    text: "Placeholder invitation to get in touch.",
    email: "hello@example.com",
    links: [
      { label: "GitHub", href: "https://github.com/your-username" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/your-username" },
    ] satisfies ContactLink[],
  },
} as const;
