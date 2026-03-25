import { useState, useEffect, useRef } from "react";
import { Megaphone, CalendarDays, User, BookOpen, PartyPopper, Clock, ChevronDown, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec";

interface Notice {
  title: string;
  description: string;
  postedBy: string;
  date: string;
  tag?: string;
}

type TagType = "holiday" | "exam" | "timetable" | "general";

const detectTag = (notice: Notice): TagType => {
  const tag = (notice.tag || "").toLowerCase().trim();
  if (tag === "holiday") return "holiday";
  if (tag === "exam" || tag === "timetable") return tag as TagType;

  // Auto-detect from title/description
  const text = `${notice.title} ${notice.description}`.toLowerCase();
  if (/holiday|vacation|leave|festival|diwali|christmas|eid|holi/i.test(text)) return "holiday";
  if (/timetable|time.?table|schedule|routine/i.test(text)) return "timetable";
  if (/exam|test|assessment|paper|midterm|final/i.test(text)) return "exam";
  return "general";
};

const tagConfig: Record<TagType, { label: string; icon: React.ReactNode; borderColor: string; bgColor: string; badgeVariant: string }> = {
  holiday: {
    label: "Holiday",
    icon: <PartyPopper size={14} />,
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    badgeVariant: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  },
  exam: {
    label: "Exam",
    icon: <BookOpen size={14} />,
    borderColor: "border-l-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    badgeVariant: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  timetable: {
    label: "Timetable",
    icon: <Clock size={14} />,
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    badgeVariant: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  general: {
    label: "Notice",
    icon: <Megaphone size={14} />,
    borderColor: "border-l-primary",
    bgColor: "bg-muted/30",
    badgeVariant: "bg-primary/10 text-primary",
  },
};

const isWithinLastWeek = (dateStr: string): boolean => {
  try {
    const parts = dateStr.split(/[\/\-\.]/);
    let parsed: Date | null = null;
    // Try common formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        parsed = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
      } else {
        // Try DD/MM/YYYY first
        parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        if (isNaN(parsed.getTime())) {
          parsed = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`);
        }
      }
    }
    if (!parsed || isNaN(parsed.getTime())) {
      parsed = new Date(dateStr);
    }
    if (isNaN(parsed.getTime())) return false;
    const now = new Date();
    const diffMs = now.getTime() - parsed.getTime();
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

/** Split description into notes + table parts (separated by ---) */
const renderDescription = (description: string, tag: TagType) => {
  const parts = description.split(/\n---\n/);
  const hasMultipleParts = parts.length > 1;
  const notesPart = hasMultipleParts ? parts[0].trim() : "";
  const tablePart = hasMultipleParts ? parts.slice(1).join("\n").trim() : description;

  const renderTable = (text: string) => {
    const lines = text.split(/\n/).filter((l) => l.trim());
    const hasDelimiters = lines.some((l) => /[|,\t]/.test(l));

    if (hasDelimiters && lines.length >= 2) {
      const delimiter = lines[0].includes("|") ? "|" : lines[0].includes("\t") ? "\t" : ",";
      const rows = lines.map((line) =>
        line.split(delimiter).map((cell) => cell.trim()).filter(Boolean)
      );

      return (
        <div className="overflow-x-auto rounded-lg border border-border mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                {rows[0].map((header, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold text-foreground border-b border-border">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  const tableElement = (tag === "timetable" || tag === "exam") ? renderTable(tablePart) : null;

  // If we rendered a table, show notes + table
  if (tableElement) {
    return (
      <div className="mt-2 space-y-3">
        {notesPart && (
          <p className="text-sm text-muted-foreground italic bg-muted/40 rounded-md px-3 py-2">
            📝 {notesPart}
          </p>
        )}
        {tableElement}
      </div>
    );
  }

  // Multi-line as list
  const lines = description.split(/\n/).filter((l) => l.trim());
  if (lines.length > 1) {
    return (
      <ul className="mt-2 space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
            {line}
          </li>
        ))}
      </ul>
    );
  }

  return <p className="text-sm text-muted-foreground mt-2">{description}</p>;
};

const NOTICES_CACHE_KEY = "noticesCache";
const NOTICES_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

const AnnouncementsSection = () => {
  const [notices, setNotices] = useState<Notice[]>(() => {
    try {
      const raw = sessionStorage.getItem(NOTICES_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < NOTICES_CACHE_EXPIRY) {
          return parsed.data;
        }
        sessionStorage.removeItem(NOTICES_CACHE_KEY);
      }
    } catch {}
    return [];
  });
  const [loading, setLoading] = useState(notices.length === 0);
  const [activeFilter, setActiveFilter] = useState<TagType | "all">("all");
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          hasFetched.current = true;
          observer.disconnect();
          fetchNotices();
        }
      },
      { rootMargin: "200px" }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const fetchNotices = async () => {
    setLoading(notices.length === 0);
    try {
      const res = await fetch(`${SCRIPT_URL}?sheet=Sheet2`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const reversed = data.reverse();
        setNotices(reversed);
        sessionStorage.setItem(NOTICES_CACHE_KEY, JSON.stringify({ data: reversed, timestamp: Date.now() }));
      }
    } catch {
      console.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  const taggedNotices = notices.map((n) => ({ ...n, detectedTag: detectTag(n) }));

  const filteredNotices =
    activeFilter === "all"
      ? taggedNotices
      : taggedNotices.filter((n) => n.detectedTag === activeFilter);

  const tagCounts = taggedNotices.reduce(
    (acc, n) => {
      acc[n.detectedTag] = (acc[n.detectedTag] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <section id="announcements" className="py-16 bg-muted/30" ref={sectionRef}>
      <div className="container max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Megaphone size={16} />
            Announcements
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">
            Notices & Announcements
          </h2>
          <p className="text-muted-foreground mt-2">
            Stay updated with the latest school notices
          </p>
        </div>

        {/* Filter Tags */}
        {!loading && notices.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({taggedNotices.length})
            </button>
            {(["holiday", "exam", "timetable", "general"] as TagType[]).map((tag) =>
              tagCounts[tag] ? (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors inline-flex items-center gap-1 ${
                    activeFilter === tag
                      ? "bg-primary text-primary-foreground"
                      : `${tagConfig[tag].badgeVariant} hover:opacity-80`
                  }`}
                >
                  {tagConfig[tag].icon}
                  {tagConfig[tag].label} ({tagCounts[tag]})
                </button>
              ) : null
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground py-10">Loading notices...</div>
        ) : filteredNotices.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">No notices yet.</div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {filteredNotices.map((notice, i) => {
              const config = tagConfig[notice.detectedTag];
              const isNew = isWithinLastWeek(notice.date);
              return (
                <AccordionItem
                  key={i}
                  value={`notice-${i}`}
                  className={`border border-border rounded-lg overflow-hidden ${config.bgColor} border-l-4 ${config.borderColor}`}
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex flex-col gap-1 text-left w-full min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ${config.badgeVariant}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        {isNew && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 animate-pulse">
                            <Sparkles size={10} />
                            New
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground shrink-0 hidden sm:block">
                          {notice.date}
                        </span>
                      </div>
                      <div className="min-w-0 w-full overflow-hidden">
                        <span className="font-heading font-semibold text-foreground text-sm block sm:truncate whitespace-nowrap sm:whitespace-normal sm:overflow-visible sm:animate-none animate-marquee">
                          {notice.title}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    {renderDescription(notice.description, notice.detectedTag)}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {notice.postedBy || "Admin"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {notice.date}
                      </span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </section>
  );
};

export default AnnouncementsSection;
