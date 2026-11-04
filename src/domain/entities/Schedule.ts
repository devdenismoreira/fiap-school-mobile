export type ClassSession = {
  /** Texto do JSON, ex.: "07:15 - 08:00". */
  time: string;
  subject: string;
};

export type ScheduleDay = {
  /** Data ISO "YYYY-MM-DD". */
  date: string;
  classes: ClassSession[];
};
