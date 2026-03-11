import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const syllabusData = [
  {
    grade: "Primary (Grades 1–5)",
    subjects: [
      { name: "English Language Arts", topics: "Reading comprehension, creative writing, grammar & vocabulary, phonics" },
      { name: "Mathematics", topics: "Arithmetic, fractions, geometry basics, word problems, mental math" },
      { name: "Science", topics: "Living & non-living things, plants & animals, weather, simple machines" },
      { name: "Social Studies", topics: "Community helpers, maps & globes, national holidays, cultural diversity" },
      { name: "Arts & Craft", topics: "Drawing, painting, clay modeling, paper craft, creative expression" },
    ],
  },
  {
    grade: "Middle School (Grades 6–8)",
    subjects: [
      { name: "English", topics: "Literature analysis, essay writing, poetry, speech & debate" },
      { name: "Mathematics", topics: "Algebra, geometry, statistics, ratios & proportions, number theory" },
      { name: "Science", topics: "Physics fundamentals, chemistry basics, biology, earth science, lab experiments" },
      { name: "Social Science", topics: "History, geography, civics, economics, current affairs" },
      { name: "Computer Science", topics: "Digital literacy, basic coding, internet safety, MS Office" },
      { name: "Physical Education", topics: "Athletics, team sports, yoga, health & hygiene" },
    ],
  },
  {
    grade: "High School (Grades 9–10)",
    subjects: [
      { name: "Mathematics", topics: "Advanced algebra, trigonometry, coordinate geometry, calculus introduction" },
      { name: "Physics", topics: "Mechanics, optics, electricity & magnetism, thermodynamics" },
      { name: "Chemistry", topics: "Periodic table, chemical reactions, organic chemistry basics, stoichiometry" },
      { name: "Biology", topics: "Cell biology, genetics, ecology, human anatomy, evolution" },
      { name: "English Literature", topics: "Shakespeare, novels, analytical essays, rhetoric" },
      { name: "Foreign Language", topics: "French / Spanish — grammar, conversation, cultural studies" },
    ],
  },
  {
    grade: "Senior Secondary (Grades 11–12)",
    subjects: [
      { name: "Science Stream", topics: "Physics, Chemistry, Mathematics / Biology, Computer Science, English" },
      { name: "Commerce Stream", topics: "Accountancy, Business Studies, Economics, Mathematics, English" },
      { name: "Arts Stream", topics: "History, Political Science, Geography, Psychology / Sociology, English" },
    ],
  },
];

const SyllabusSection = () => (
  <section id="syllabus" className="py-20 bg-muted">
    <div className="container max-w-4xl">
      <div className="text-center mb-16">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Curriculum</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          Syllabus Overview
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Our comprehensive curriculum is designed to build strong foundations and encourage critical thinking at every level.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-4">
        {syllabusData.map((grade, i) => (
          <AccordionItem
            key={i}
            value={`grade-${i}`}
            className="bg-card rounded-xl shadow-card border-none px-6"
          >
            <AccordionTrigger className="text-lg font-heading font-semibold text-foreground hover:no-underline">
              {grade.grade}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-2">
                {grade.subjects.map((sub) => (
                  <div key={sub.name} className="border-l-4 border-secondary pl-4">
                    <p className="font-semibold text-foreground">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">{sub.topics}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default SyllabusSection;
