const searchAreas = [
  "Best schools in Vizag",
  "Best CBSE schools in Vizag",
  "Best schools in Seethammadhara",
  "Best CBSE schools in Seethammadhara, Visakhapatnam",
];

const LocalSeoSection = () => (
  <section className="py-20 bg-muted/40">
    <div className="container max-w-5xl">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold tracking-widest uppercase text-accent mb-2">Why Families Choose Us</p>
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
          A Trusted Choice for Families Looking for the Best Schools in Vizag
        </h2>
        <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
          Bright Future Academy is a trusted school for families across Visakhapatnam who want strong
          academics, disciplined learning, caring teachers, and a campus that helps children grow with
          confidence. Parents exploring the best schools in Vizag and the best CBSE schools in Vizag
          often look for a school that balances academic results with values, communication, and
          student support.
        </p>
        <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
          We also welcome families from Seethammadhara and nearby neighborhoods who are searching for
          the best schools in Seethammadhara, best schools in Seethammadhara Vizag, and best CBSE
          schools in Seethammadhara Visakhapatnam. Our location in Visakhapatnam makes us a convenient
          option for parents searching online for the best schools near me with a focus on quality
          education and holistic development.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {searchAreas.map((area) => (
          <div
            key={area}
            className="rounded-xl border border-border bg-card px-5 py-4 text-sm font-medium text-foreground shadow-card"
          >
            {area}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LocalSeoSection;
