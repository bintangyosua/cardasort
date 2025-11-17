export interface CountResponse {
  total: number;
  [key: string]: any;
}

export interface EntitiesCountResponse {
  entities: CountResponse;
  categories: CountResponse;
}

export interface OverviewCounts {
  users: CountResponse;
  entities: EntitiesCountResponse;
  chatSessions: CountResponse;
  discussionRooms: CountResponse;
}

export interface OverviewApiResponse {
  success: boolean;
  data: OverviewCounts;
  error?: string;
}

// Pie Chart Types
export interface PieCategoryItem {
  id: number | null;
  name: string;
  slug: string | null;
  count: number;
  percentage: number;
}

export interface EntitiesPieChartResponse {
  success: boolean;
  time: string;
  filters: {
    status: string;
    dateField: string;
    from: string | null;
    to: string | null;
    includeUncategorized: boolean;
    topN: number | null;
  };
  total_entities_matched: number;
  total_assignments: number;
  categories: PieCategoryItem[];
}
