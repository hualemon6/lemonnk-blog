import { z, type CollectionEntry } from 'astro:content';
import metadata from '../data/journey.json';
import { projects } from './projects';
import { path } from '../utils/path';

export const journeyCategories = ['all', 'learning', 'research', 'project', 'life'] as const;
export type JourneyCategory = Exclude<typeof journeyCategories[number], 'all'>;
export type JourneyVisual = 'journal' | 'code' | 'signal' | 'network' | 'grid';
const momentFields = {
  category: z.enum(['learning', 'research', 'project', 'life']),
  title: z.string().min(1),
  summary: z.string(),
  detail: z.string(),
  image: z.string().optional(),
  visual: z.enum(['journal', 'code', 'signal', 'network', 'grid']),
};
const momentMetadata = z.array(z.union([
  z.object({ postId: z.string().min(1), ...momentFields }),
  z.object({
    id: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
      const date = new Date(value);
      return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
    }, 'Use a real calendar date in YYYY-MM-DD format'),
    url: z.string().regex(/^(https?:\/\/|\/(?!\/))/).optional(),
    ...momentFields,
  }),
])).parse(metadata);
export interface JourneyEvent {
  id: string;
  category: JourneyCategory;
  title: string;
  summary: string;
  detail: string;
  date?: string;
  image?: string;
  visual: JourneyVisual;
  url?: string;
  external: boolean;
}

// Dates always come from published content. Undated projects form a separate group.
export function getJourney(posts: CollectionEntry<'posts'>[]): JourneyEvent[] {
  const entries: JourneyEvent[] = posts.filter((post) => !post.data.draft).map((post) => {
    const meta = momentMetadata.find((entry) => 'postId' in entry && entry.postId === post.id);
    return {
      id: `post-${post.id}`,
      category: meta?.category ?? 'learning',
      title: meta?.title ?? post.data.title,
      summary: meta?.summary ?? post.data.title,
      detail: meta?.detail ?? post.data.title,
      date: post.data.pubDate.toISOString().slice(0, 10),
      image: meta?.image ?? post.data.image,
      visual: meta?.visual ?? 'journal',
      url: path(`/posts/${post.id}/`),
      external: false,
    };
  });
  for (const moment of momentMetadata) {
    if ('postId' in moment) continue;
    entries.push({
      ...moment,
      id: `moment-${moment.id}`,
      url: moment.url ? path(moment.url) : undefined,
      external: Boolean(moment.url && /^https?:\/\//.test(moment.url)),
    });
  }
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
    throw new Error('Journey entries must have unique ids. Check src/data/journey.json.');
  }
  entries.sort((a, b) => a.date!.localeCompare(b.date!));
  return [
    ...projects.map((project): JourneyEvent => ({
      id: `project-${project.id}`,
      category: 'project',
      title: project.name,
      summary: project.narrativeZh || project.narrative,
      detail: project.narrativeZh || project.narrative,
      visual: project.id.includes('rag') ? 'network' : 'grid',
      url: project.url || path('/projects/'),
      external: Boolean(project.url),
    })),
    ...entries,
  ];
}
