export interface MediaAsset {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export const MEDIA_ASSETS = {
  heroCampus: {
    src: '/images/hero_campus_library_1794638342764.jpg',
    width: 1408,
    height: 768,
    alt: 'Diverse U.S. college students walking across a sunlit red-brick university quad toward the campus library',
    caption: 'American university campus quad during autumn term',
  },
  graduation: {
    src: '/images/students_graduation_success_1794638342911.jpg',
    width: 1280,
    height: 960,
    alt: 'Diverse graduating university students in navy and gold academic gowns celebrating scholarship completion on campus',
    caption: 'Graduating scholarship recipients celebrating commencement',
  },
  stemLab: {
    src: '/images/stem_research_lab_1794638342903.jpg',
    width: 1280,
    height: 960,
    alt: 'Diverse university STEM students collaborating at a sunlit laboratory bench with scientific instruments',
    caption: 'Funded undergraduate STEM research team in campus laboratory',
  },
  readingRoom: {
    src: '/images/university_reading_room_1794638343996.jpg',
    width: 1280,
    height: 960,
    alt: 'Students studying in a sunlit American university library reading room with oak tables and brass lamps',
    caption: 'University library reading room and research archive',
  },
  counselorEssay: {
    src: '/images/counselor_student_essay_1794638343904.jpg',
    width: 1280,
    height: 960,
    alt: 'High school senior reviewing scholarship application essays and financial aid portal with a college advisor',
    caption: 'Financial aid advising and scholarship essay review session',
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaAssetKey = keyof typeof MEDIA_ASSETS;
