/**
 * Static placeholder data for the featured tuitions grid.
 *
 * To integrate an API later, fetch the data where the page is rendered
 * (e.g. `app/page.tsx`) and pass it to `<FeaturedTuitions tuitions={...} />`
 * — the presentation components only depend on the `Tuition` type.
 */

export type TuitionMode = "online" | "in-person"

export type Tuition = {
  id: string
  /** Subject shown on the burgundy tag, e.g. "Data Science". */
  subject: string
  /** Class level shown on the right of the card footer, e.g. "Class HSC". */
  level: string
  mode: TuitionMode
  /** Required when `mode` is "in-person", shown in the image badge. */
  location?: string
  /** Local image path in `public/images`. */
  image: string
  /** Reserved for the future tuition detail route. */
  slug: string
}

export const featuredTuitions: Tuition[] = [
  {
    id: "tui_1",
    subject: "Data Science",
    level: "Class University",
    mode: "online",
    image: "/images/tuition-1.jpg",
    slug: "data-science",
  },
  {
    id: "tui_2",
    subject: "Organic Chemistry",
    level: "Class HSC",
    mode: "in-person",
    location: "Dhanmondi, Dhaka",
    image: "/images/tuition-5.jpg",
    slug: "organic-chemistry",
  },
  {
    id: "tui_3",
    subject: "Advanced Mathematics",
    level: "Class University",
    mode: "online",
    image: "/images/tuition-2.jpg",
    slug: "advanced-mathematics",
  },
  {
    id: "tui_4",
    subject: "English Literature",
    level: "Class SSC",
    mode: "online",
    image: "/images/tuition-4.jpg",
    slug: "english-literature",
  },
  {
    id: "tui_5",
    subject: "Physics",
    level: "Class HSC",
    mode: "in-person",
    location: "Mirpur, Dhaka",
    image: "/images/tuition-3.jpg",
    slug: "physics",
  },
  {
    id: "tui_6",
    subject: "Primary Science",
    level: "Class 6-8",
    mode: "in-person",
    location: "Uttara, Dhaka",
    image: "/images/tuition-6.jpg",
    slug: "primary-science",
  },
]
